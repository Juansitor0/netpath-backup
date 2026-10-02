import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { completeOnboarding, getUserWorkspace, setStepProgress, type RoadmapLevel } from "./repository";

const levelSchema = z.enum(["base", "fundamentos", "pleno", "senior"]);
const answerValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const progressRouter = router({
  workspace: protectedProcedure.query(({ ctx }) => getUserWorkspace(ctx.user.id)),

  set: protectedProcedure
    .input(z.object({
      stepId: z.string().trim().min(1).max(120),
      status: z.enum(["not_started", "in_progress", "completed", "skipped"]),
    }))
    .mutation(({ ctx, input }) => setStepProgress(ctx.user.id, input.stepId, input.status)),
});

export const onboardingRouter = router({
  complete: protectedProcedure
    .input(z.object({
      roleTitle: z.string().trim().max(160).optional(),
      yearsExperience: z.number().int().min(0).max(60).optional(),
      skills: z.array(z.string().trim().min(1).max(80)).max(40).default([]),
      quizAnswers: z.record(z.string(), answerValueSchema).default({}),
      confirmedLevel: levelSchema.optional(),
    }))
    .mutation(({ ctx, input }) => {
      const evaluation = evaluateLevel(input.yearsExperience ?? 0, input.skills, input.quizAnswers);
      const confirmedLevel = input.confirmedLevel ?? evaluation.recommendedLevel;
      return completeOnboarding({
        userId: ctx.user.id,
        roleTitle: input.roleTitle,
        yearsExperience: input.yearsExperience,
        skills: input.skills,
        quizAnswers: input.quizAnswers,
        recommendedLevel: evaluation.recommendedLevel,
        confirmedLevel,
        quizScore: evaluation.score,
        nextStepId: evaluation.nextStepId,
      });
    }),
});

function evaluateLevel(yearsExperience: number, skills: string[], answers: Record<string, string | number | boolean>) {
  const numericAnswers = Object.values(answers)
    .map((answer) => typeof answer === "number" ? answer : Number(answer))
    .filter((answer) => Number.isFinite(answer));
  const quizScore = numericAnswers.length ? Math.min(48, Math.max(0, Math.round((numericAnswers.reduce((sum, answer) => sum + answer, 0) / numericAnswers.length) * 8))) : 0;
  const experienceScore = Math.min(32, yearsExperience * 8);
  const breadthScore = Math.min(20, skills.length * 4);
  const score = Math.min(100, quizScore + experienceScore + breadthScore);
  const recommendedLevel: RoadmapLevel = score >= 76 ? "senior" : score >= 51 ? "pleno" : score >= 26 ? "fundamentos" : "base";
  const nextStepId = recommendedLevel === "base" ? "fundamentos" : recommendedLevel === "fundamentos" ? "routing" : recommendedLevel === "pleno" ? "automation" : "design";
  return { score, recommendedLevel, nextStepId };
}
