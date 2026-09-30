import { z } from "zod";
import {
  catalogItemStatusSchema,
  catalogItemTypeSchema,
  catalogModalitySchema,
  type CatalogItem,
  type CatalogSource,
} from "@shared/catalog";

export const NIC_BR_ENDPOINTS = {
  agenda: "https://cursoseventos.nic.br/agenda",
  semanaCapacitacao: "https://semanacap.bcp.nic.br/",
  noticias: "https://nic.br/noticias/indice/",
} as const;

export const NIC_BR_SOURCE: CatalogSource = {
  id: "nicbr",
  name: "NIC.br — Cursos e eventos",
  kind: "agenda",
  status: "active",
  syncPolicy: "daily",
  homepage: NIC_BR_ENDPOINTS.agenda,
  endpoint: NIC_BR_ENDPOINTS.agenda,
  notes: "Fonte pública inicial; a estrutura interna do portal não é tratada como API estável.",
};

export const nicBrCandidateSchema = z.object({
  externalId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1),
  type: catalogItemTypeSchema.default("course"),
  provider: z.string().trim().min(1).default("NIC.br"),
  description: z.string().trim().min(1).optional(),
  url: z.string().url().optional(),
  modality: catalogModalitySchema.default("unknown"),
  status: catalogItemStatusSchema.default("draft"),
  startDate: z.string().trim().min(1).nullable().optional(),
  endDate: z.string().trim().min(1).nullable().optional(),
  registrationStart: z.string().trim().min(1).nullable().optional(),
  registrationEnd: z.string().trim().min(1).nullable().optional(),
  durationHours: z.number().int().nonnegative().nullable().optional(),
  topics: z.array(z.string().trim().min(1)).default([]),
  certificationIds: z.array(z.string().trim().min(1)).default([]),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type NicBrCandidate = z.infer<typeof nicBrCandidateSchema>;

export function normalizeNicBrCandidate(input: unknown): CatalogItem {
  const candidate = nicBrCandidateSchema.parse(input);
  const slug = slugify(candidate.externalId ?? candidate.title);

  return {
    id: `nicbr:${slug}`,
    sourceId: NIC_BR_SOURCE.id,
    externalId: candidate.externalId,
    type: candidate.type,
    title: candidate.title,
    provider: candidate.provider,
    description: candidate.description,
    url: candidate.url ?? NIC_BR_SOURCE.endpoint,
    modality: candidate.modality,
    status: candidate.status,
    startDate: candidate.startDate,
    endDate: candidate.endDate,
    registrationStart: candidate.registrationStart,
    registrationEnd: candidate.registrationEnd,
    durationHours: candidate.durationHours,
    topics: candidate.topics,
    certificationIds: candidate.certificationIds,
    tags: candidate.tags,
    updatedAt: new Date().toISOString(),
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
