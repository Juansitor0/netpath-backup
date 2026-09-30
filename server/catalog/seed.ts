import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseCatalogImport } from "@shared/catalog";
import { applyCatalogImport } from "./repository";

let seedPromise: Promise<void> | null = null;

export function seedCatalogDefaults() {
  seedPromise ??= runSeed().catch((error) => {
    console.warn("[Catalog] Seed skipped:", error instanceof Error ? error.message : error);
  });
  return seedPromise;
}

async function runSeed() {
  const sourcesPath = path.resolve(process.cwd(), "data/catalog/sources.json");
  const certificationsPath = path.resolve(process.cwd(), "data/catalog/certifications.json");
  const [sourcesRaw, certificationsRaw] = await Promise.all([
    readFile(sourcesPath, "utf8"),
    readFile(certificationsPath, "utf8"),
  ]);
  const sources = parseCatalogImport(JSON.parse(sourcesRaw));
  const certifications = parseCatalogImport(JSON.parse(certificationsRaw));
  const input = parseCatalogImport({
    version: 1,
    sources: sources.sources,
    certifications: certifications.certifications,
    items: certifications.items,
  });
  await applyCatalogImport(input, undefined, "certifications.json", "json");
  console.info(`[Catalog] Seeded ${input.certifications.length} certifications`);
}
