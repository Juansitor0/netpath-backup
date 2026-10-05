import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Compass,
  Filter,
  Gauge,
  GitBranch,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Network,
  PanelLeftClose,
  Route,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import Catalog from "./Catalog";
import OnboardingCard from "../components/OnboardingCard";
import { trpc } from "../lib/trpc";
import {
  achievements,
  certifications,
  initialCompleted,
  roadmapSteps,
  stageMeta,
  type Certification,
  type RoadmapStep,
  type StageId,
  type ViewId,
} from "../data/netpath";

const navItems: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "roadmap", label: "Minha trilha", icon: Route },
  { id: "certifications", label: "Certificações", icon: Award },
  { id: "catalog", label: "Catálogo", icon: BookOpen },
  { id: "achievements", label: "Conquistas", icon: Trophy },
];

const stageOrder: StageId[] = ["base", "fundamentos", "especialista", "avancado"];

function getStoredProgress() {
  if (typeof window === "undefined") return initialCompleted;
  try {
    const stored = window.localStorage.getItem("netpath-progress-v2");
    return stored ? { ...initialCompleted, ...JSON.parse(stored) } : initialCompleted;
  } catch {
    return initialCompleted;
  }
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function IconForAchievement({ icon }: { icon: string }) {
  const icons = { signal: Zap, route: GitBranch, stack: Network, star: Sparkles, target: Target };
  const Icon = icons[icon as keyof typeof icons] ?? Target;
  return <Icon size={20} strokeWidth={1.8} />;
}

function StatusDot({ status }: { status: "done" | "in-progress" | "locked" }) {
  return <span className={cn("status-dot", status)} aria-label={status === "done" ? "Concluído" : status === "locked" ? "Bloqueado" : "Em andamento"} />;
}

function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: "cyan" | "mint" | "amber" }) {
  return (
    <div className={cn("progress-track", `tone-${tone}`)} aria-label={`${value}% concluído`}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function StepStatus({ completed, canStart }: { completed: boolean; canStart: boolean }) {
  if (completed) return <span className="status-label is-done"><Check size={13} /> Concluído</span>;
  if (!canStart) return <span className="status-label is-locked"><LockKeyhole size={13} /> Bloqueado</span>;
  return <span className="status-label is-progress"><Circle size={10} fill="currentColor" /> Em andamento</span>;
}

function Sidebar({ activeView, setActiveView, collapsed, setCollapsed, progress }: { activeView: ViewId; setActiveView: (view: ViewId) => void; collapsed: boolean; setCollapsed: (value: boolean) => void; progress: number }) {
  return (
    <aside className={cn("sidebar", collapsed && "sidebar-collapsed")}>
      <div className="brand-lockup">
        <img src="/netpath-logo.png" alt="" className="brand-mark" />
        {!collapsed && <div><strong>NETPATH</strong><span>career ops / 01</span></div>}
      </div>
      <div className="sidebar-label">MAPA DE CARREIRA</div>
      <nav className="main-nav" aria-label="Navegação principal">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={cn("nav-item", activeView === id && "active")} onClick={() => setActiveView(id)} title={collapsed ? label : undefined}>
            <Icon size={18} strokeWidth={activeView === id ? 2.2 : 1.8} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && activeView === id && <span className="nav-active-bar" />}
          </button>
        ))}
      </nav>
      {!collapsed && (
        <div className="sidebar-bottom">
          <div className="sidebar-card">
            <span className="mini-eyebrow">STATUS DA ROTA</span>
            <div className="sidebar-progress-line"><span>Pleno → Sênior</span><b>{progress}%</b></div>
            <ProgressBar value={progress} tone="mint" />
            <span className="sidebar-card-copy">Continue constante. O próximo salto é técnico.</span>
          </div>
          <button className="sidebar-settings"><Settings2 size={16} /> Preferências da trilha <ChevronRight size={15} /></button>
        </div>
      )}
      <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>
        {collapsed ? <PanelLeftClose size={17} /> : <><PanelLeftClose size={17} /> Recolher menu</>}
      </button>
    </aside>
  );
}

function PageHeader({ activeView, onMobileMenu, userName, userRole }: { activeView: ViewId; onMobileMenu: () => void; userName: string; userRole: string }) {
  const current = navItems.find((item) => item.id === activeView) ?? navItems[0];
  return (
    <header className="page-header">
      <div className="header-title-group">
        <button className="mobile-menu" onClick={onMobileMenu} aria-label="Abrir menu"><Menu size={20} /></button>
        <div className="eyebrow"><span className="signal-pulse" /> NETPATH / {current.label.toUpperCase()}</div>
        <h1>{activeView === "overview" ? "Seu próximo salto começa aqui." : current.label}</h1>
        <p>{activeView === "overview" ? "Uma visão clara do que estudar, praticar e validar para chegar ao próximo nível." : "Organize seu avanço com contexto, dependências e uma ação por vez."}</p>
      </div>
      <div className="header-actions">
        <button className="icon-button" aria-label="Pesquisar"><Search size={18} /></button>
        <div className="header-divider" />
        <a className="user-chip" href="/profile"><span className="user-avatar">{userName.slice(0, 2).toUpperCase()}</span><div><strong>{userName}</strong><span>{userRole}</span></div><ChevronRight size={15} /></a>
      </div>
    </header>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone, progress }: { label: string; value: string; detail: string; icon: typeof Gauge; tone: string; progress?: number }) {
  return (
    <div className={cn("stat-card", `stat-${tone}`)}>
      <div className="stat-topline"><span>{label}</span><Icon size={17} /></div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
      {progress !== undefined && <ProgressBar value={progress} tone={tone === "mint" ? "mint" : tone === "amber" ? "amber" : "cyan"} />}
    </div>
  );
}

function NextAction({ step, onComplete, completed, canStart }: { step: RoadmapStep; onComplete: () => void; completed: boolean; canStart: boolean }) {
  return (
    <section className="next-action-card">
      <div className="next-action-top"><span className="eyebrow dark-eyebrow">RECOMENDAÇÃO / 01</span><span className="next-action-spark"><Sparkles size={16} /></span></div>
      <div className="next-action-icon"><Compass size={21} /></div>
      <h2>{completed ? "Próximo checkpoint liberado." : step.title}</h2>
      <p>{completed ? "Você concluiu esta etapa. Veja a próxima recomendação na sua trilha." : step.description}</p>
      <div className="next-action-meta"><span><BookOpen size={14} /> {step.duration}</span><span><GitBranch size={14} /> {step.dependencies.length ? `${step.dependencies.length} pré-requisito${step.dependencies.length > 1 ? "s" : ""}` : "Ponto de partida"}</span></div>
      <button className="primary-button full-button" onClick={onComplete} disabled={!canStart || completed}>{completed ? <><CheckCircle2 size={17} /> Etapa concluída</> : <>{canStart ? "Marcar como concluída" : "Conclua os pré-requisitos"} <ArrowUpRight size={17} /></>}</button>
    </section>
  );
}

function StageRail({ completed, canStart, onToggle }: { completed: Record<string, boolean>; canStart: (step: RoadmapStep) => boolean; onToggle: (id: string) => void }) {
  return (
    <section className="panel journey-panel">
      <div className="section-heading"><div><span className="eyebrow">RADAR DA JORNADA</span><h2>Da base à senioridade</h2></div><button className="text-button" onClick={() => document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth" })}>Ver trilha completa <ArrowUpRight size={15} /></button></div>
      <div className="journey-rail">
        {stageOrder.map((stageId) => {
          const stageSteps = roadmapSteps.filter((step) => step.stage === stageId);
          const done = stageSteps.filter((step) => completed[step.id]).length;
          const stage = stageMeta[stageId];
          return (
            <div key={stageId} className={cn("journey-stage", `journey-${stage.color}`)}>
              <div className="journey-stage-head"><span className="journey-stage-index">0{stageOrder.indexOf(stageId) + 1}</span><div><strong>{stage.title}</strong><span>{stage.subtitle}</span></div><span className="stage-count">{done}/{stageSteps.length}</span></div>
              <div className="journey-stage-line"><span style={{ width: `${stageSteps.length ? (done / stageSteps.length) * 100 : 0}%` }} /></div>
              <div className="journey-stage-steps">
                {stageSteps.map((step) => (
                  <button key={step.id} className={cn("mini-step", completed[step.id] && "done", canStart(step) && !completed[step.id] && "available")} onClick={() => canStart(step) && onToggle(step.id)}>
                    <span className="mini-step-node">{completed[step.id] ? <Check size={12} /> : canStart(step) ? <Circle size={9} fill="currentColor" /> : <LockKeyhole size={11} />}</span><span>{step.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Overview({ completed, canStart, onToggle, progress, nextStep, unlockedAchievements }: { completed: Record<string, boolean>; canStart: (step: RoadmapStep) => boolean; onToggle: (id: string) => void; progress: number; nextStep: RoadmapStep; unlockedAchievements: number }) {
  const completedCount = roadmapSteps.filter((step) => completed[step.id]).length;
  const currentStage = completedCount < 4 ? "Fundamentos" : completedCount < 8 ? "Especialista" : "Avançado";
  return (
    <div className="view-content overview-content">
      <OnboardingCard />
      <div className="overview-grid">
        <div className="stats-grid">
          <StatCard label="PROGRESSO GERAL" value={`${progress}%`} detail="da trilha concluída" icon={Gauge} tone="cyan" progress={progress} />
          <StatCard label="ETAPAS CONCLUÍDAS" value={`${completedCount} / ${roadmapSteps.length}`} detail="checkpoints validados" icon={CheckCircle2} tone="mint" />
          <StatCard label="NÍVEL ATUAL" value={currentStage} detail="próximo: avançado" icon={BarChart3} tone="amber" />
        </div>
        <NextAction step={nextStep} onComplete={() => onToggle(nextStep.id)} completed={Boolean(completed[nextStep.id])} canStart={canStart(nextStep)} />
      </div>
      <StageRail completed={completed} canStart={canStart} onToggle={onToggle} />
      <div className="bottom-grid">
        <section className="panel focus-panel">
          <div className="section-heading"><div><span className="eyebrow">EM FOCO AGORA</span><h2>Construa repertório</h2></div><span className="section-meta">{currentStage.toUpperCase()} / 03</span></div>
          <div className="focus-list">
            <div className="focus-item"><div className="focus-icon blue"><Network size={18} /></div><div><strong>Roteamento é o seu gargalo atual</strong><span>Feche a etapa essencial antes de escolher uma certificação de fabricante.</span></div><ChevronRight size={16} /></div>
            <div className="focus-item"><div className="focus-icon yellow"><ShieldCheck size={18} /></div><div><strong>Escolha uma rota alternativa</strong><span>Junos ou HCI-Datacom ampliam sua leitura de ambientes reais.</span></div><ChevronRight size={16} /></div>
            <div className="focus-item"><div className="focus-icon green"><GitBranch size={18} /></div><div><strong>Documente cada laboratório</strong><span>Seu portfólio cresce junto com a experiência operacional.</span></div><ChevronRight size={16} /></div>
          </div>
        </section>
        <section className="panel achievement-preview">
          <div className="section-heading"><div><span className="eyebrow">SINAL DE PROGRESSO</span><h2>Conquistas</h2></div><span className="achievement-counter">{unlockedAchievements} / {achievements.length}</span></div>
          <div className="achievement-orbit">
            {achievements.slice(0, 4).map((achievement) => {
              const unlocked = completedCount >= achievement.threshold;
              return <div key={achievement.id} className={cn("achievement-chip", unlocked && "unlocked")}><div className="achievement-icon"><IconForAchievement icon={achievement.icon} /></div><span>{achievement.title}</span></div>;
            })}
          </div>
          <p className="panel-note">Cada marco desbloqueado é uma evidência do seu avanço — não apenas uma porcentagem.</p>
        </section>
      </div>
    </div>
  );
}

function Roadmap({ completed, canStart, onToggle }: { completed: Record<string, boolean>; canStart: (step: RoadmapStep) => boolean; onToggle: (id: string) => void }) {
  return (
    <div className="view-content" id="roadmap">
      <div className="view-intro"><div><span className="eyebrow">MAPA DE DEPENDÊNCIAS</span><h2>Uma etapa prepara a próxima.</h2><p>Não é uma lista de cursos. É uma sequência de capacidade técnica, evidência e contexto.</p></div><div className="legend"><span><i className="legend-dot done" /> Concluído</span><span><i className="legend-dot available" /> Disponível</span><span><i className="legend-dot locked" /> Bloqueado</span></div></div>
      <div className="roadmap-list">
        {stageOrder.map((stageId) => {
          const stage = stageMeta[stageId];
          const steps = roadmapSteps.filter((item) => item.stage === stageId);
          return <div className="roadmap-stage" key={stageId}><div className={cn("roadmap-stage-marker", `marker-${stage.color}`)}><span>{String(stageOrder.indexOf(stageId) + 1).padStart(2, "0")}</span><strong>{stage.title}</strong><small>{stage.subtitle}</small></div><div className="roadmap-cards">{steps.map((step, index) => <StepCard key={step.id} step={step} completed={Boolean(completed[step.id])} canStart={canStart(step)} onToggle={() => onToggle(step.id)} isLast={index === steps.length - 1} />)}</div></div>;
        })}
      </div>
    </div>
  );
}

function StepCard({ step, completed, canStart, onToggle, isLast }: { step: RoadmapStep; completed: boolean; canStart: boolean; onToggle: () => void; isLast: boolean }) {
  return (
    <article className={cn("roadmap-card", completed && "completed-card", !canStart && !completed && "locked-card")}>
      <div className="roadmap-node"><StatusDot status={completed ? "done" : canStart ? "in-progress" : "locked"} />{!isLast && <span className="node-line" />}</div>
      <div className="roadmap-card-body"><div className="roadmap-card-top"><span className="eyebrow">{step.eyebrow}</span><StepStatus completed={completed} canStart={canStart} /></div><h3>{step.title}</h3><p>{step.description}</p><div className="roadmap-card-footer"><div className="tag-row">{step.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div><span className="duration"><BookOpen size={13} /> {step.duration}</span></div>{step.dependencies.length > 0 && <div className="dependency-line"><GitBranch size={13} /> Depende de: {step.dependencies.map((dependency) => roadmapSteps.find((item) => item.id === dependency)?.title).join(" + ")}</div>}</div><button className={cn("step-action", completed && "step-action-done")} onClick={onToggle} disabled={!canStart && !completed} aria-label={completed ? `Desmarcar ${step.title}` : `Marcar ${step.title} como concluída`}>{completed ? <Check size={18} /> : canStart ? <ArrowUpRight size={18} /> : <LockKeyhole size={16} />}</button>
    </article>
  );
}

function CertificationCard({ cert, completed, canStart, onToggle }: { cert: Certification; completed: boolean; canStart: boolean; onToggle: () => void }) {
  const status = completed ? "Concluído" : canStart ? "Disponível" : "Pré-requisitos pendentes";
  return <article className={cn("cert-card", `cert-${cert.accent}`, completed && "cert-completed")}><div className="cert-card-header"><div className="vendor-badge">{cert.vendor === "HCI-Datacom" ? "HCI" : cert.vendor.slice(0, 2).toUpperCase()}</div><div><span className="cert-vendor">{cert.vendor}</span><span className="cert-level">{cert.level}</span></div><span className={cn("cert-status", completed ? "done" : canStart ? "available" : "locked")}>{completed ? <Check size={12} /> : canStart ? <Circle size={9} fill="currentColor" /> : <LockKeyhole size={12} />} {status}</span></div><div className="cert-rule" /><h3>{cert.name}</h3><strong className="cert-tagline">{cert.tagline}</strong><p>{cert.description}</p><div className="cert-prerequisites"><span className="mini-eyebrow">PRÉ-REQUISITOS</span>{cert.prerequisites.map((item) => <span key={item} className={cn("prerequisite", completed && "prerequisite-done")}><Check size={12} /> {item}</span>)}</div><div className="cert-card-footer"><span><BookOpen size={13} /> Preparação: {cert.exam}</span><button className={cn("outline-button", completed && "outline-completed")} onClick={onToggle} disabled={!canStart && !completed}>{completed ? "Concluída" : canStart ? "Adicionar à rota" : "Ver dependências"} <ChevronRight size={14} /></button></div></article>;
}

function CertificationsView({ completed, canStart, onToggle }: { completed: Record<string, boolean>; canStart: (step: RoadmapStep) => boolean; onToggle: (id: string) => void }) {
  const [vendor, setVendor] = useState("Todos");
  const [level, setLevel] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const filtered = certifications.filter((cert) => { const step = roadmapSteps.find((item) => item.id === cert.stepId)!; const currentStatus = completed[cert.stepId] ? "Concluído" : canStart(step) ? "Disponível" : "Pendente"; return (vendor === "Todos" || cert.vendor === vendor) && (level === "Todos" || cert.level === level) && (status === "Todos" || currentStatus === status); });
  return <div className="view-content"><div className="view-intro cert-intro"><div><span className="eyebrow">CATÁLOGO DE CERTIFICAÇÕES</span><h2>Escolha com contexto.</h2><p>Certificações são marcos. A base e a prática são o que fazem o marco valer.</p></div><div className="cert-count"><strong>{filtered.length}</strong><span>rotas visíveis</span></div></div><div className="filter-bar"><div className="filter-label"><Filter size={15} /> FILTRAR POR</div><select value={vendor} onChange={(event) => setVendor(event.target.value)}><option>Todos</option><option>Cisco</option><option>Juniper</option><option>HCI-Datacom</option><option>Trilha alvo</option></select><select value={level} onChange={(event) => setLevel(event.target.value)}><option>Todos</option><option>Base</option><option>Intermediário</option><option>Avançado</option></select><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Disponível</option><option>Pendente</option><option>Concluído</option></select><button className="clear-filters" onClick={() => { setVendor("Todos"); setLevel("Todos"); setStatus("Todos"); }}><X size={14} /> Limpar</button></div><div className="cert-grid">{filtered.map((cert) => { const step = roadmapSteps.find((item) => item.id === cert.stepId)!; return <CertificationCard key={cert.id} cert={cert} completed={Boolean(completed[cert.stepId])} canStart={canStart(step)} onToggle={() => onToggle(cert.stepId)} />; })}</div></div>;
}

function AchievementsView({ completed }: { completed: Record<string, boolean> }) {
  const count = roadmapSteps.filter((step) => completed[step.id]).length;
  return <div className="view-content"><div className="view-intro achievements-intro"><div><span className="eyebrow">SISTEMA DE ACHIEVEMENTS</span><h2>Evidências que ficam.</h2><p>Pequenos marcos tornam uma jornada longa visível — e ajudam a manter consistência.</p></div><div className="achievement-score"><Trophy size={22} /><strong>{achievements.filter((item) => count >= item.threshold).length}</strong><span>desbloqueadas</span></div></div><div className="achievement-grid">{achievements.map((achievement) => { const unlocked = count >= achievement.threshold; const progress = Math.min(100, Math.round((count / achievement.threshold) * 100)); return <article key={achievement.id} className={cn("achievement-card", unlocked && "achievement-unlocked")}><div className="achievement-card-top"><div className="large-achievement-icon"><IconForAchievement icon={achievement.icon} /></div><span className={cn("unlock-state", unlocked ? "unlocked" : "locked")}>{unlocked ? <><Check size={13} /> Desbloqueada</> : <><LockKeyhole size={13} /> Em progresso</>}</span></div><h3>{achievement.title}</h3><p>{achievement.description}</p><div className="achievement-progress"><div className="achievement-progress-meta"><span>{Math.min(count, achievement.threshold)} / {achievement.threshold} etapas</span><strong>{progress}%</strong></div><ProgressBar value={progress} tone={unlocked ? "mint" : "cyan"} /></div></article>; })}</div></div>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>(getStoredProgress);
  const authQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const workspaceQuery = trpc.progress.workspace.useQuery(undefined, { enabled: Boolean(authQuery.data), retry: false });
  const progressMutation = trpc.progress.set.useMutation();

  useEffect(() => { window.localStorage.setItem("netpath-progress-v2", JSON.stringify(completed)); }, [completed]);
  useEffect(() => {
    if (!workspaceQuery.data || workspaceQuery.data.progress.length === 0) return;
    const remoteCompleted = Object.fromEntries(workspaceQuery.data.progress.filter((item) => item.status === "completed").map((item) => [item.stepId, true]));
    setCompleted((current) => ({ ...current, ...remoteCompleted }));
  }, [workspaceQuery.data]);

  const canStart = (step: RoadmapStep) => step.dependencies.every((dependency) => completed[dependency]);
  const toggleStep = (id: string) => {
    const nextCompleted = !completed[id];
    setCompleted((current) => ({ ...current, [id]: nextCompleted }));
    if (authQuery.data) {
      progressMutation.mutate({ stepId: id, status: nextCompleted ? "completed" : "not_started" });
    }
  };
  const completedCount = roadmapSteps.filter((step) => completed[step.id]).length;
  const progress = Math.round((completedCount / roadmapSteps.length) * 100);
  const activeStepId = workspaceQuery.data?.progress.find((item) => item.status === "in_progress")?.stepId;
  const nextStep = (activeStepId && roadmapSteps.find((step) => step.id === activeStepId)) || roadmapSteps.find((step) => !completed[step.id] && canStart(step)) || roadmapSteps[roadmapSteps.length - 1];
  const unlockedAchievements = useMemo(() => achievements.filter((achievement) => completedCount >= achievement.threshold).length, [completedCount]);

  const handleNavigation = (view: ViewId) => { setActiveView(view); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const userName = authQuery.data?.name?.trim() || workspaceQuery.data?.profile?.roleTitle || "Profissional de redes";
  const userRole = workspaceQuery.data?.profile?.roleTitle || "Sua jornada NetPath";
  return <div className="app-shell"><div className={cn("mobile-backdrop", mobileMenuOpen && "visible")} onClick={() => setMobileMenuOpen(false)} /><div className={cn("sidebar-wrap", mobileMenuOpen && "mobile-open")}><Sidebar activeView={activeView} setActiveView={handleNavigation} collapsed={collapsed} setCollapsed={setCollapsed} progress={progress} /></div><main className="main-area"><PageHeader activeView={activeView} onMobileMenu={() => setMobileMenuOpen(true)} userName={userName} userRole={userRole} />{activeView === "overview" && <Overview completed={completed} canStart={canStart} onToggle={toggleStep} progress={progress} nextStep={nextStep} unlockedAchievements={unlockedAchievements} />}{activeView === "roadmap" && <Roadmap completed={completed} canStart={canStart} onToggle={toggleStep} />}{activeView === "certifications" && <CertificationsView completed={completed} canStart={canStart} onToggle={toggleStep} />}{activeView === "catalog" && <Catalog />}{activeView === "achievements" && <AchievementsView completed={completed} />}</main></div>;
}
