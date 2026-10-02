import { catalogImportFileSchema } from "@shared/catalog";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { applyCatalogImport, applyNicBrSync, listCatalog, previewNicBrSync } from "./repository";
import { nicBrCandidateSchema } from "./nicbr";

export const catalogRouter = router({
  list: publicProcedure.query(() => listCatalog()),

  previewImport: adminProcedure
    .input(z.object({
      fileName: z.string().trim().min(1).max(255).optional(),
      format: z.enum(["json", "csv"]),
      payload: catalogImportFileSchema,
    }))
    .mutation(({ input }) => ({
      valid: true as const,
      fileName: input.fileName ?? null,
      format: input.format,
      counts: {
        sources: input.payload.sources.length,
        certifications: input.payload.certifications.length,
        items: input.payload.items.length,
      },
      ids: {
        sources: input.payload.sources.map((source) => source.id),
        certifications: input.payload.certifications.map((certification) => certification.id),
        items: input.payload.items.map((item) => item.id),
      },
    })),

  applyImport: adminProcedure
    .input(z.object({
      fileName: z.string().trim().min(1).max(255).optional(),
      format: z.enum(["json", "csv"]),
      payload: catalogImportFileSchema,
    }))
    .mutation(({ input, ctx }) => applyCatalogImport(input.payload, ctx.user.id, input.fileName, input.format)),

  previewNicBr: adminProcedure.mutation(() => previewNicBrSync()),

  applyNicBr: adminProcedure
    .input(z.object({ items: z.array(nicBrCandidateSchema).max(500) }))
    .mutation(({ input, ctx }) => applyNicBrSync(input.items, ctx.user.id)),
});
