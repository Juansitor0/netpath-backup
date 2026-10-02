import { describe, expect, it } from "vitest";
import { parseCatalogCsv, parseCatalogImport } from "@shared/catalog";
import { normalizeNicBrCandidate, parseNicBrAgendaHtml } from "./nicbr";

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

  it("extracts a public NIC.br agenda card for administrative preview", () => {
    const candidates = parseNicBrAgendaHtml(`
      <h2 class="title-acontece-home curso-pai">Curso CCNAv7: Introdução às Redes</h2>
      <div class="card"><h3>Turma 24 — A distância</h3><p>Fundamentos de redes, IPv6 e Packet Tracer.</p><span>Inscrições: 01 de janeiro de 2026</span><a href="/turma/inscrever/abc123" title="Inscrições">Inscrições</a></div>
      <h2 class="title-acontece-home curso-pai">Semana de Capacitação Online</h2>
      <div><h3>RPKI e segurança de roteamento</h3><p>Conteúdo técnico para operadores.</p></div>
    `);

    expect(candidates).toHaveLength(2);
    expect(candidates[0]?.type).toBe("course");
    expect(candidates[0]?.status).toBe("open");
    expect(candidates[0]?.url).toContain("abc123");
    expect(candidates[1]?.type).toBe("event");
  });
});
