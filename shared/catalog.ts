import { z } from "zod";

export const catalogSourceKindSchema = z.enum(["manual", "agenda", "rss", "api"]);
export const catalogSourceStatusSchema = z.enum(["active", "paused", "archived"]);
export const catalogSyncPolicySchema = z.enum(["on-demand", "daily", "weekly"]);
export const catalogItemTypeSchema = z.enum(["course", "event"]);
export const catalogItemStatusSchema = z.enum([
  "draft",
  "upcoming",
  "open",
  "ongoing",
  "closed",
  "evergreen",
]);
export const catalogModalitySchema = z.enum(["online", "in-person", "hybrid", "self-paced", "unknown"]);
export const certificationLevelSchema = z.enum(["Base", "Intermediário", "Avançado"]);

const optionalText = z.string().trim().min(1).optional();
const optionalNullableText = z.string().trim().min(1).nullable().optional();

export const catalogSourceSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  kind: catalogSourceKindSchema,
  status: catalogSourceStatusSchema,
  syncPolicy: catalogSyncPolicySchema,
  homepage: z.string().url(),
  endpoint: z.string().url().optional(),
  notes: optionalText,
});

export const catalogItemSchema = z.object({
  id: z.string().trim().min(1),
  sourceId: z.string().trim().min(1),
  externalId: optionalText,
  type: catalogItemTypeSchema,
  title: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  description: optionalText,
  url: z.string().url().optional(),
  modality: catalogModalitySchema.default("unknown"),
  status: catalogItemStatusSchema.default("draft"),
  startDate: optionalNullableText,
  endDate: optionalNullableText,
  registrationStart: optionalNullableText,
  registrationEnd: optionalNullableText,
  durationHours: z.number().int().nonnegative().nullable().optional(),
  topics: z.array(z.string().trim().min(1)).default([]),
  certificationIds: z.array(z.string().trim().min(1)).default([]),
  tags: z.array(z.string().trim().min(1)).default([]),
  updatedAt: z.string().trim().min(1).optional(),
});

export const certificationRecordSchema = z.object({
  id: z.string().trim().min(1),
  sourceId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  level: certificationLevelSchema,
  description: optionalText,
  url: z.string().url().optional(),
  roadmapStepId: optionalText,
  prerequisites: z.array(z.string().trim().min(1)).default([]),
  topics: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  updatedAt: z.string().trim().min(1).optional(),
});

export const catalogImportFileSchema = z.object({
  version: z.literal(1),
  sources: z.array(catalogSourceSchema).default([]),
  certifications: z.array(certificationRecordSchema).default([]),
  items: z.array(catalogItemSchema).default([]),
});

export type CatalogSourceKind = z.infer<typeof catalogSourceKindSchema>;
export type CatalogSource = z.infer<typeof catalogSourceSchema>;
export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type CertificationRecord = z.infer<typeof certificationRecordSchema>;
export type CatalogImportFile = z.infer<typeof catalogImportFileSchema>;
export type CatalogCsvRow = Record<string, string>;

export function parseCatalogImport(input: unknown): CatalogImportFile {
  return catalogImportFileSchema.parse(input);
}

export function parseCatalogCsv(input: string): CatalogCsvRow[] {
  const lines = input.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  if (headers.some((header) => header.length === 0)) {
    throw new Error("CSV contains an empty header");
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    if (values.length !== headers.length) {
      throw new Error(`CSV row ${index + 2} has ${values.length} values; expected ${headers.length}`);
    }
    return Object.fromEntries(headers.map((header, valueIndex) => [header, values[valueIndex].trim()]));
  });
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted value");
  values.push(current);
  return values;
}
