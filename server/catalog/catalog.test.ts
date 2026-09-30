import { describe, expect, it } from "vitest";
import { parseCatalogCsv, parseCatalogImport } from "@shared/catalog";
import { normalizeNicBrCandidate } from "./nicbr";

describe("catalog contracts", () => {
  it("accepts a versioned JSON import and applies defaults", () => {
    const result = parseCatalogImport({
      version: 1,
      certifications: [
        {
          id: "cnna",
          sourceId: "manual",
          name: "CNNA",
          provider: "Trilha alvo",
          level: "Avançado",
          status: "active",
        },
      ],
    });

    expect(result.version).toBe(1);
    expect(result.items).toEqual([]);
    expect(result.certifications[0]?.prerequisites).toEqual([]);
  });

  it("rejects an unsupported import version", () => {
    expect(() => parseCatalogImport({ version: 2 })).toThrow();
  });

  it("parses quoted CSV values without splitting embedded commas", () => {
    const rows = parseCatalogCsv('id,name,provider\ncnna,"CNNA, trilha alvo",Manual');
    expect(rows).toEqual([{ id: "cnna", name: "CNNA, trilha alvo", provider: "Manual" }]);
  });

  it("normalizes a NIC.br candidate with a stable source prefix", () => {
    const item = normalizeNicBrCandidate({
      externalId: "b cop-39",
      title: "Curso BCOP — turma 39",
      status: "upcoming",
      modality: "online",
      topics: ["BGP", "Boas práticas"],
    });

    expect(item.id).toBe("nicbr:b-cop-39");
    expect(item.sourceId).toBe("nicbr");
    expect(item.url).toBe("https://cursoseventos.nic.br/agenda");
  });
});
