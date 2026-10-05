import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { confirmResume, getResume, importResume, removeResume, type ResumeProfile } from "./resume";

const profileSchema = z.object({
  fullName: z.string().max(160), headline: z.string().max(240), location: z.string().max(160), linkedinUrl: z.string().max(512), portfolioUrl: z.string().max(512), summary: z.string().max(6000),
  skills: z.array(z.string().max(120)).max(40), certifications: z.array(z.string().max(240)).max(40),
  experiences: z.array(z.object({ company: z.string().max(180), title: z.string().max(180), period: z.string().max(120), description: z.string().max(3000) })).max(20),
  education: z.array(z.object({ institution: z.string().max(240), course: z.string().max(240), period: z.string().max(120) })).max(20),
});

export const profileRouter = router({
  resume: protectedProcedure.query(({ ctx }) => getResume(ctx.user.id)),
  importResume: protectedProcedure.input(z.object({ fileName: z.string().min(1).max(255), mimeType: z.string(), base64: z.string().min(1).max(12_000_000), consent: z.boolean() })).mutation(({ ctx, input }) => importResume(ctx.user.id, input)),
  confirmResume: protectedProcedure.input(z.object({ id: z.number().int().positive(), profile: profileSchema })).mutation(({ ctx, input }) => confirmResume(ctx.user.id, input.id, input.profile as ResumeProfile)),
  removeResume: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => removeResume(ctx.user.id, input.id)),
});
