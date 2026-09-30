import { desc, eq } from "drizzle-orm";
import {
  catalogImports,
  catalogItems,
  catalogSources,
  certifications,
  type InsertCatalogItem,
  type InsertCatalogSource,
  type InsertCertification,
} from "../../drizzle/schema";
import type { CatalogImportFile } from "@shared/catalog";
import { getDb } from "../db";

export async function listCatalog() {
  const db = await getDb();
  if (!db) {
    return { sources: [], certifications: [], items: [], lastImport: null };
  }

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
      const values: InsertCatalogSource = {
        id: source.id,
        name: source.name,
        kind: source.kind,
        status: source.status,
        syncPolicy: source.syncPolicy,
        homepage: source.homepage,
        endpoint: source.endpoint,
        notes: source.notes,
      };
      await tx.insert(catalogSources).values(values).onDuplicateKeyUpdate({
        set: {
          name: source.name,
          kind: source.kind,
          status: source.status,
          syncPolicy: source.syncPolicy,
          homepage: source.homepage,
          endpoint: source.endpoint,
          notes: source.notes,
        },
      });
    }

    for (const certification of input.certifications) {
      const values: InsertCertification = {
        id: certification.id,
        sourceId: certification.sourceId,
        name: certification.name,
        provider: certification.provider,
        level: certification.level,
        description: certification.description,
        url: certification.url,
        roadmapStepId: certification.roadmapStepId,
        prerequisites: certification.prerequisites,
        topics: certification.topics,
        status: certification.status,
        isManualOverride: true,
        sourceUpdatedAt: toDate(certification.updatedAt),
      };
      await tx.insert(certifications).values(values).onDuplicateKeyUpdate({
        set: {
          sourceId: certification.sourceId,
          name: certification.name,
          provider: certification.provider,
          level: certification.level,
          description: certification.description,
          url: certification.url,
          roadmapStepId: certification.roadmapStepId,
          prerequisites: certification.prerequisites,
          topics: certification.topics,
          status: certification.status,
          isManualOverride: true,
          sourceUpdatedAt: toDate(certification.updatedAt),
        },
      });
    }

    for (const item of input.items) {
      const values: InsertCatalogItem = {
        id: item.id,
        sourceId: item.sourceId,
        externalId: item.externalId,
        type: item.type,
        title: item.title,
        provider: item.provider,
        description: item.description,
        url: item.url,
        modality: item.modality,
        status: item.status,
        startDate: item.startDate,
        endDate: item.endDate,
        registrationStart: item.registrationStart,
        registrationEnd: item.registrationEnd,
        durationHours: item.durationHours,
        topics: item.topics,
        certificationIds: item.certificationIds,
        tags: item.tags,
        isManualOverride: true,
        sourceUpdatedAt: toDate(item.updatedAt),
      };
      await tx.insert(catalogItems).values(values).onDuplicateKeyUpdate({
        set: {
          sourceId: item.sourceId,
          externalId: item.externalId,
          type: item.type,
          title: item.title,
          provider: item.provider,
          description: item.description,
          url: item.url,
          modality: item.modality,
          status: item.status,
          startDate: item.startDate,
          endDate: item.endDate,
          registrationStart: item.registrationStart,
          registrationEnd: item.registrationEnd,
          durationHours: item.durationHours,
          topics: item.topics,
          certificationIds: item.certificationIds,
          tags: item.tags,
          isManualOverride: true,
          sourceUpdatedAt: toDate(item.updatedAt),
        },
      });
    }

    const [importRecord] = await tx.insert(catalogImports).values({
      fileName,
      format,
      status: "applied",
      sourceCount: input.sources.length,
      certificationCount: input.certifications.length,
      itemCount: input.items.length,
      summary: JSON.stringify({ sourceIds: input.sources.map((source) => source.id) }),
      createdBy,
    }).$returningId();

    return {
      importId: importRecord?.id ?? null,
      sourceCount: input.sources.length,
      certificationCount: input.certifications.length,
      itemCount: input.items.length,
    };
  });
}

function toDate(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
