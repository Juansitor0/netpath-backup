import type { CatalogSource } from "@shared/catalog";
import { NIC_BR_SOURCE } from "./nicbr";

export type CatalogAdapter = {
  source: CatalogSource;
  sync: () => Promise<never[]>;
};

export const MANUAL_SOURCE: CatalogSource = {
  id: "manual",
  name: "Catálogo manual",
  kind: "manual",
  status: "active",
  syncPolicy: "on-demand",
  homepage: "https://netpath.local/catalogo",
  notes: "Registros editoriais importados por JSON ou CSV.",
};

export const catalogSourceRegistry: CatalogSource[] = [MANUAL_SOURCE, NIC_BR_SOURCE];

export function getCatalogSource(sourceId: string) {
  return catalogSourceRegistry.find((source) => source.id === sourceId);
}
