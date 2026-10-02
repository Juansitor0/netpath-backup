import { desc, eq } from "drizzle-orm";
import {
  catalogImports,
  catalogItems,
  catalogSources,
  catalogSyncRuns,
  certifications,
  type InsertCatalogItem,
  type InsertCatalogSource,
  type InsertCertification,
} from "../../drizzle/schema";
import type { CatalogImportFile } from "@shared/catalog";
import { getDb } from "../db";
import { NIC_BR_ENDPOINTS, NIC_BR_SOURCE, normalizeNicBrCandidate, parseNicBrAgendaHtml, type NicBrCandidate } from "./nicbr";

export async function listCatalog() {
  const db = await getDb();
  if (!db) return { sources: [], certifications: [], items: [], lastImport: null };
  const [sources, certificationRows, items, importRows] = await Promise.all([
    db.select().from(catalogSources).orderBy(catalogSources.name),
    db.select().from(certifications).where(eq(certifications.status, "active")).orderBy(certifications.name),
    db.select().from(catalogItems).orderBy(desc(catalogItems.updatedAt)),
    db.select().from(catalogImports).orderBy(desc(catalogImports.createdAt)).limit(1),
  ]);
  return { sources, certifications: certificationRows, items, lastImport: importRows[0] ?? null };
}

export async function applyCatalogImport(input: CatalogImportFile, createdBy?: number, fileName?: string, format: "json" | "csv" = "json") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async (tx) => {
    for (const source of input.sources) {
      const values: InsertCatalogSource = { id: source.id, name: source.name, kind: source.kind, status: source.status, syncPolicy: source.syncPolicy, homepage: source.homepage, endpoint: source.endpoint, notes: source.notes };
      await tx.insert(catalogSources).values(values).onDuplicateKeyUpdate({ set: { name: source.name, kind: source.kind, status: source.status, syncPolicy: source.syncPolicy, homepage: source.homepage, endpoint: source.endpoint, notes: source.notes } });
    }
    for (const certification of input.certifications) {
      const values: InsertCertification = { id: certification.id, sourceId: certification.sourceId, name: certification.name, provider: certification.provider, level: certification.level, description: certification.description, url: certification.url, roadmapStepId: certification.roadmapStepId, prerequisites: certification.prerequisites, topics: certification.topics, status: certification.status, isManualOverride: true, sourceUpdatedAt: toDate(certification.updatedAt) };
      await tx.insert(certifications).values(values).onDuplicateKeyUpdate({ set: { sourceId: certification.sourceId, name: certification.name, provider: certification.provider, level: certification.level, description: certification.description, url: certification.url, roadmapStepId: certification.roadmapStepId, prerequisites: certification.prerequisites, topics: certification.topics, status: certification.status, isManualOverride: true, sourceUpdatedAt: toDate(certification.updatedAt) } });
    }
    for (const item of input.items) {
      const values: InsertCatalogItem = { id: item.id, sourceId: item.sourceId, externalId: item.externalId, type: item.type, title: item.title, provider: item.provider, description: item.description, url: item.url, modality: item.modality, status: item.status, startDate: item.startDate, endDate: item.endDate, registrationStart: item.registrationStart, registrationEnd: item.registrationEnd, durationHours: item.durationHours, topics: item.topics, certificationIds: item.certificationIds, tags: item.tags, isManualOverride: true, sourceUpdatedAt: toDate(item.updatedAt) };
      await tx.insert(catalogItems).values(values).onDuplicateKeyUpdate({ set: { sourceId: item.sourceId, externalId: item.externalId, type: item.type, title: item.title, provider: item.provider, description: item.description, url: item.url, modality: item.modality, status: item.status, startDate: item.startDate, endDate: item.endDate, registrationStart: item.registrationStart, registrationEnd: item.registrationEnd, durationHours: item.durationHours, topics: item.topics, certificationIds: item.certificationIds, tags: item.tags, isManualOverride: true, sourceUpdatedAt: toDate(item.updatedAt) } });
    }
    const [importRecord] = await tx.insert(catalogImports).values({ fileName, format, status: "applied", sourceCount: input.sources.length, certificationCount: input.certifications.length, itemCount: input.items.length, summary: JSON.stringify({ sourceIds: input.sources.map((source) => source.id) }), createdBy }).$returningId();
    return { importId: importRecord?.id ?? null, sourceCount: input.sources.length, certificationCount: input.certifications.length, itemCount: input.items.length };
  });
}

export async function previewNicBrSync() {
  const response = await fetch(NIC_BR_ENDPOINTS.agenda, { headers: { Accept: "text/html", "User-Agent": "NetPath/1.0 catalog sync" }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`NIC.br respondeu HTTP ${response.status}`);
  const candidates = parseNicBrAgendaHtml(await response.text());
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select().from(catalogItems).where(eq(catalogItems.sourceId, NIC_BR_SOURCE.id));
  const existingById = new Map(existing.map((item) => [item.id, item]));
  const normalized = candidates.map((candidate) => normalizeNicBrCandidate(candidate));
  const changes = normalized.map((item) => { const previous = existingById.get(item.id); return { item, change: !previous ? "new" as const : hasChanged(previous, item) ? "updated" as const : "unchanged" as const }; });
  return { source: NIC_BR_SOURCE, fetchedAt: new Date().toISOString(), total: changes.length, newCount: changes.filter((item) => item.change === "new").length, updatedCount: changes.filter((item) => item.change === "updated").length, unchangedCount: changes.filter((item) => item.change === "unchanged").length, items: changes.filter((item) => item.change !== "unchanged").map(({ item, change }) => ({ ...item, change })) };
}

export async function applyNicBrSync(items: NicBrCandidate[], createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const normalized = items.map((item) => normalizeNicBrCandidate(item));
  return db.transaction(async (tx) => {
    await tx.insert(catalogSources).values({ ...NIC_BR_SOURCE }).onDuplicateKeyUpdate({ set: { name: NIC_BR_SOURCE.name, status: NIC_BR_SOURCE.status, syncPolicy: NIC_BR_SOURCE.syncPolicy, homepage: NIC_BR_SOURCE.homepage, endpoint: NIC_BR_SOURCE.endpoint, notes: NIC_BR_SOURCE.notes } });
    let newCount = 0;
    let updatedCount = 0;
    for (const item of normalized) {
      const [previous] = await tx.select().from(catalogItems).where(eq(catalogItems.id, item.id)).limit(1);
      const values: InsertCatalogItem = { id: item.id, sourceId: item.sourceId, externalId: item.externalId, type: item.type, title: item.title, provider: item.provider, description: item.description, url: item.url, modality: item.modality, status: item.status, startDate: item.startDate, endDate: item.endDate, registrationStart: item.registrationStart, registrationEnd: item.registrationEnd, durationHours: item.durationHours, topics: item.topics, certificationIds: item.certificationIds, tags: item.tags, isManualOverride: false, sourceUpdatedAt: toDate(item.updatedAt) };
      if (previous?.isManualOverride) continue;
      if (!previous) newCount += 1; else if (hasChanged(previous, item)) updatedCount += 1; else continue;
      await tx.insert(catalogItems).values(values).onDuplicateKeyUpdate({ set: { externalId: values.externalId, type: values.type, title: values.title, provider: values.provider, description: values.description, url: values.url, modality: values.modality, status: values.status, startDate: values.startDate, endDate: values.endDate, registrationStart: values.registrationStart, registrationEnd: values.registrationEnd, durationHours: values.durationHours, topics: values.topics, certificationIds: values.certificationIds, tags: values.tags, isManualOverride: false, sourceUpdatedAt: values.sourceUpdatedAt } });
    }
    const [run] = await tx.insert(catalogSyncRuns).values({ sourceId: NIC_BR_SOURCE.id, status: "completed", foundCount: normalized.length, newCount, updatedCount, finishedAt: new Date() }).$returningId();
    return { syncRunId: run?.id ?? null, foundCount: normalized.length, newCount, updatedCount };
  });
}

function hasChanged(previous: { title: string; description: string | null; url: string | null; status: string; startDate: string | null }, next: { title: string; description?: string; url?: string; status: string; startDate?: string | null }) {
  return previous.title !== next.title || (previous.description ?? "") !== (next.description ?? "") || (previous.url ?? "") !== (next.url ?? "") || previous.status !== next.status || (previous.startDate ?? "") !== (next.startDate ?? "");
}

function toDate(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
