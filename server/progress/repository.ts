import { and, desc, eq } from "drizzle-orm";
import { onboardingSessions, userProfiles, userProgress } from "../../drizzle/schema";
import { getDb } from "../db";

export type RoadmapLevel = "base" | "fundamentos" | "pleno" | "senior";

export async function getUserWorkspace(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  await ensureProfile(userId);
  const [profiles, progress] = await Promise.all([
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1),
    db.select().from(userProgress).where(eq(userProgress.userId, userId)).orderBy(desc(userProgress.updatedAt)),
  ]);

  return { profile: profiles[0] ?? null, progress };
}

export async function setStepProgress(userId: number, stepId: string, status: "not_started" | "in_progress" | "completed" | "skipped", source: "manual" | "onboarding" | "import" = "manual") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const completedAt = status === "completed" ? new Date() : null;
  await db.insert(userProgress).values({ userId, stepId, status, source, completedAt }).onDuplicateKeyUpdate({
    set: { status, source, completedAt },
  });
  return { stepId, status, completedAt };
}

export async function completeOnboarding(input: {
  userId: number;
  roleTitle?: string;
  yearsExperience?: number;
  skills: string[];
  quizAnswers: Record<string, unknown>;
  recommendedLevel: RoadmapLevel;
  confirmedLevel: RoadmapLevel;
  quizScore: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  return db.transaction(async (tx) => {
    await tx.insert(userProfiles).values({
      userId: input.userId,
      roleTitle: input.roleTitle,
      yearsExperience: input.yearsExperience,
      currentLevel: input.confirmedLevel,
      onboardingStatus: "completed",
      quizScore: input.quizScore,
      skills: input.skills,
      confirmedAt: new Date(),
    }).onDuplicateKeyUpdate({
      set: {
        roleTitle: input.roleTitle,
        yearsExperience: input.yearsExperience,
        currentLevel: input.confirmedLevel,
        onboardingStatus: "completed",
        quizScore: input.quizScore,
        skills: input.skills,
        confirmedAt: new Date(),
      },
    });

    const [session] = await tx.insert(onboardingSessions).values({
      userId: input.userId,
      status: "completed",
      answers: input.quizAnswers,
      recommendedLevel: input.recommendedLevel,
      confirmedLevel: input.confirmedLevel,
    }).$returningId();

    return { sessionId: session?.id ?? null, level: input.confirmedLevel, quizScore: input.quizScore };
  });
}

async function ensureProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(userProfiles).values({ userId, skills: [] }).onDuplicateKeyUpdate({ set: { userId } });
}
