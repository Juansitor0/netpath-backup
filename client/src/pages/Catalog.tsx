import { useRef, useState } from "react";
import { AlertCircle, ArrowUpRight, BookOpen, CheckCircle2, Database, FileUp, RefreshCw, ShieldCheck, UploadCloud } from "lucide-react";
import { catalogImportFileSchema, type CatalogImportFile } from "@shared/catalog";
import { startLogin } from "../const";
import { certifications as localCertifications } from "../data/netpath";
import { trpc } from "../lib/trpc";

function toneForProvider(provider: string) {
  const normalized = provider.toLowerCase();
  if (normalized.includes("juniper")) return "juniper";
  if (normalized.includes("huawei") || normalized.includes("hci")) return "huawei";
  if (normalized.includes("trilha")) return "target";
  return "cisco";
}

export default function Catalog() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalogQuery = trpc.catalog.list.useQuery(undefined, { retry: false, staleTime: 30_000 });
  const currentUser = trpc.auth.me.useQuery(undefined, { retry: false });
  const importMutation = trpc.catalog.applyImport.useMutation({
    onSuccess: async (result) => {
      setMessage({ type: "success", text: `Importação concluída: ${result.certificationCount} certificações e ${result.itemCount} cursos/eventos.` });
      await catalogQuery.refetch();
    },
    onError: (error) => setMessage({ type: "error", text: error.message || "Não foi possível aplicar o arquivo." }),
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const liveCertifications = catalogQuery.data?.certifications ?? [];
  const usingFallback = !catalogQuery.data || liveCertifications.length === 0;
  const cards = usingFallback
    ? localCertifications.map((certification) => ({
        id: certification.id,
        name: certification.name,
        provider: certification.vendor,
        level: certification.level,
        description: certification.description,
        roadmapStepId: certification.stepId,
        status: "active",
      }))
    : liveCertifications;

  async function handleImport(file: File) {
    setMessage(null);
    if (!currentUser.data) {
      startLogin();
      return;
    }
    if (currentUser.data.role !== "admin") {
      setMessage({ type: "error", text: "Somente um administrador pode aplicar um catálogo." });
      return;
    }

    try {
      const text = await file.text();
      const payload: CatalogImportFile = catalogImportFileSchema.parse(JSON.parse(text));
      importMutation.mutate({ fileName: file.name, format: "json", payload });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "JSON inválido";
      setMessage({ type: "error", text: `Arquivo rejeitado: ${reason}` });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="view-content catalog-content">
      <div className="view-intro catalog-intro">
        <div>
          <span className="eyebrow">CATÁLOGO PERSISTENTE</span>
          <h2>Conteúdo com fonte e histórico.</h2>
          <p>Certificações, cursos e eventos agora podem sair do arquivo local e entrar no banco com revisão administrativa.</p>
        </div>
        <div className="catalog-health"><span className={catalogQuery.isError ? "health-dot error" : "health-dot"} /><strong>{catalogQuery.isError ? "Modo local" : "Banco conectado"}</strong><small>{catalogQuery.isError ? "fallback do MVP" : "API / catálogo"}</small></div>
      </div>

      {message && <div className={`catalog-message ${message.type}`}><span>{message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}</span><p>{message.text}</p></div>}

      <div className="catalog-toolbar">
        <div className="catalog-stats"><div><Database size={16} /><strong>{catalogQuery.data?.sources.length ?? 2}</strong><span>fontes</span></div><div><ShieldCheck size={16} /><strong>{cards.length}</strong><span>certificações</span></div><div><BookOpen size={16} /><strong>{catalogQuery.data?.items.length ?? 0}</strong><span>cursos/eventos</span></div></div>
        <div className="catalog-actions"><button className="outline-button" onClick={() => catalogQuery.refetch()} disabled={catalogQuery.isFetching}><RefreshCw size={14} className={catalogQuery.isFetching ? "spin" : ""} /> Atualizar</button><input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleImport(file); }} /><button className="primary-button" onClick={() => fileInputRef.current?.click()} disabled={importMutation.isPending}><FileUp size={15} /> Importar JSON</button></div>
      </div>

      <section className="catalog-source-strip"><div className="source-avatar">N</div><div><span className="mini-eyebrow">FONTE MONITORADA</span><strong>NIC.br — Cursos e eventos</strong><small>Agenda pública · sincronização diária planejada · <a href="https://cursoseventos.nic.br/agenda" target="_blank" rel="noreferrer">abrir fonte <ArrowUpRight size={12} /></a></small></div><span className="source-status">ATIVA</span></section>

      <div className="catalog-section-heading"><div><span className="eyebrow">CERTIFICAÇÕES NA BASE</span><h3>Rota editorial</h3></div><span>{usingFallback ? "Dados locais do MVP" : "Dados persistidos"}</span></div>
      <div className="catalog-card-grid">{cards.map((certification) => <article className={`catalog-card cert-${toneForProvider(certification.provider)}`} key={certification.id}><div className="catalog-card-top"><div className="catalog-provider-mark">{certification.provider.slice(0, 2).toUpperCase()}</div><span className="catalog-level">{certification.level}</span></div><h3>{certification.name}</h3><strong>{certification.provider}</strong><p>{certification.description}</p><div className="catalog-card-footer"><span>{certification.roadmapStepId ? `Etapa: ${certification.roadmapStepId}` : "Sem etapa vinculada"}</span><span className="catalog-active"><i /> {certification.status}</span></div></article>)}</div>
      <p className="catalog-footnote"><UploadCloud size={14} /> A importação JSON valida o arquivo antes de gravar. Cursos e certificações externos não substituem edições manuais sem uma ação explícita.</p>
    </div>
  );
}
