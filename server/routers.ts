import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { catalogRouter } from "./catalog/router";
import { onboardingRouter } from "./progress/router";
import { progressRouter } from "./progress/router";
import { profileRouter } from "./profile/router";
import { z } from "zod";
import { authenticateLocalAccount, createLocalAccount, revokeLocalSession } from "./localAuth";
import { parse as parseCookie } from "cookie";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  catalog: catalogRouter,
  progress: progressRouter,
  onboarding: onboardingRouter,
  profile: profileRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), age: z.number().int().min(13).max(120), roleTitle: z.string().trim().min(2).max(160), email: z.string().email().max(320), password: z.string().min(10).max(128) })).mutation(async ({ input, ctx }) => {
      const result = await createLocalAccount(input);
      ctx.res.cookie(COOKIE_NAME, result.sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 30 });
      return { success: true } as const;
    }),
    login: publicProcedure.input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(128) })).mutation(async ({ input, ctx }) => {
      const result = await authenticateLocalAccount(input.email, input.password);
      ctx.res.cookie(COOKIE_NAME, result.sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 30 });
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const token = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME];
      if (token) await revokeLocalSession(token);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
