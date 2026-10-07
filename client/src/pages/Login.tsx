import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Network, Route, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { startLogin } from "../const";
import { trpc } from "../lib/trpc";

type AuthMode = "login" | "register";

export default function Login() {
  const authQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const [mode, setMode] = useState<AuthMode>("login");

  useEffect(() => {
    if (authQuery.data) window.location.replace("/");
  }, [authQuery.data]);

  const isRegistering = mode === "register";

  return <main className="login-shell">
    <section className="login-visual">
      <div className="login-brand"><span className="login-brand-mark"><Network size={19} /></span><div><strong>NETPATH</strong><span>career ops / 01</span></div></div>
      <div className="login-visual-content"><span className="eyebrow login-eyebrow"><span className="signal-pulse" /> PLATAFORMA DE CARREIRA EM REDES</span><h1>Transforme experiência em <em>próximo nível.</em></h1><p>Uma rota clara para estudar, praticar, validar certificações e construir evidências técnicas até a senioridade.</p><div className="login-proof-list"><span><CheckCircle2 size={15} /> Trilha com dependências reais</span><span><CheckCircle2 size={15} /> Cursos e eventos no mesmo lugar</span><span><CheckCircle2 size={15} /> Progresso salvo no seu perfil</span></div></div>
      <div className="login-visual-footer"><span>NIC.br / Cisco / Juniper / Huawei</span><span>NETPATH 2026</span></div>
    </section>
    <section className="login-panel"><div className="login-panel-inner">
      <div className="login-mobile-brand"><span className="login-brand-mark"><Network size={18} /></span><strong>NETPATH</strong></div>
      <div className="login-panel-heading"><span className="login-kicker"><Sparkles size={14} /> SUA JORNADA</span><h2>{isRegistering ? "Crie sua conta." : "Entre para continuar."}</h2><p>{isRegistering ? "Registre sua conta Manus para salvar seu nivelamento, currículo e evolução na trilha NetPath." : "Use sua conta Manus para salvar o nivelamento, acompanhar a trilha e receber recomendações personalizadas."}</p></div>
      <div className="auth-mode-switch" role="tablist" aria-label="Acesso ao NetPath"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} role="tab" aria-selected={mode === "login"}>Entrar</button><a href="/register" role="tab"> <UserPlus size={14} /> Criar conta</a></div>
      <button className="login-primary" onClick={startLogin} disabled={authQuery.isLoading}>{authQuery.isLoading ? "Verificando sessão..." : <>{isRegistering ? "Criar minha conta Manus" : "Entrar com minha conta"} <ArrowRight size={17} /></>}</button>
      <div className="login-divider"><span>{isRegistering ? "registro seguro" : "acesso seguro"}</span></div>
      <div className="login-security"><ShieldCheck size={18} /><div><strong>{isRegistering ? "Cadastro protegido pela Manus" : "Seus dados ficam protegidos"}</strong><span>Você será levado à página oficial da Manus para {isRegistering ? "criar ou concluir sua conta" : "entrar"}. O NetPath não armazena sua senha.</span></div></div>
      <div className="login-return"><Route size={15} /><span>{isRegistering ? "Depois do cadastro, você volta automaticamente ao NetPath e fará um nivelamento rápido." : "Primeira vez aqui? Se ainda não tiver conta, escolha “Criar conta” acima."}</span></div>
      <a className="login-back" href="/">Voltar para a página inicial</a>
    </div></section>
  </main>;
}
