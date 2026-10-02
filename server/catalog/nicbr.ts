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

/**
 * Parser deliberadamente limitado aos cartões públicos da agenda.
 * O HTML pode mudar; candidatos inválidos são descartados pelo schema.
 */
export function parseNicBrAgendaHtml(html: string): NicBrCandidate[] {
  const candidates: NicBrCandidate[] = [];
  const headingPattern = /<h2[^>]*class=["'][^"']*title-acontece-home[^"']*["'][^>]*>([\s\S]*?)<\/h2>/gi;
  const headings = [...html.matchAll(headingPattern)];

  for (let index = 0; index < headings.length; index += 1) {
    const title = cleanText(headings[index][1]);
    if (!title || /nenhum evento|agenda com todos/i.test(title)) continue;
    const start = headings[index].index ?? 0;
    const end = headings[index + 1]?.index ?? Math.min(html.length, start + 24000);
    const block = html.slice(start, end);
    const subtitle = cleanText(block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "");
    const description = cleanText(block.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? subtitle);
    const registrationHref = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*title=["']Inscri/i)?.[1];
    const url = registrationHref ? new URL(registrationHref, NIC_BR_ENDPOINTS.agenda).toString() : NIC_BR_ENDPOINTS.agenda;
    const dateText = cleanText(block.match(/(?:Quando|Inscri[cç][oõ]es):[\s\S]{0,240}/i)?.[0] ?? "");
    const type = /evento|fórum|forum|live|semana de capacitação/i.test(`${title} ${subtitle}`) ? "event" : "course";
    const modality = /presencial|auditório|blumenau|s[aã]o paulo|lajeado/i.test(block) ? "in-person" : /a distância|online|on-line|youtube/i.test(block) ? "online" : "unknown";
    const topics = topicMatches(`${title} ${subtitle} ${description}`);
    const externalId = block.match(/\/turma\/([^"'/?]+)/i)?.[1] ?? `${slugify(title)}-${index + 1}`;

    candidates.push(nicBrCandidateSchema.parse({
      externalId,
      title: subtitle && subtitle !== title ? `${title} — ${subtitle}` : title,
      type,
      provider: /cisco/i.test(title) ? "NIC.br + Cisco" : /huawei|hcia/i.test(title) ? "NIC.br + Huawei" : "NIC.br",
      description: description.slice(0, 4000),
      url,
      modality,
      status: /inscri[cç][oõ]es/i.test(block) ? "open" : "upcoming",
      startDate: dateText.slice(0, 160) || null,
      topics,
      tags: [type === "event" ? "evento" : "curso", "NIC.br", ...topics].slice(0, 12),
    }));
  }

  return candidates;
}

function topicMatches(value: string) {
  const dictionary = ["IPv4", "IPv6", "BGP", "OSPF", "RPKI", "DNS", "MPLS", "Segment Routing", "VoIP", "automação", "segurança", "Cisco", "Huawei", "CCNA", "HCIA"];
  return dictionary.filter((topic) => value.toLocaleLowerCase("pt-BR").includes(topic.toLocaleLowerCase("pt-BR")));
}

function cleanText(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
