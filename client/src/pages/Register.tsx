import { useEffect } from "react";
import { ArrowRight, CheckCircle2, Network, Route, ShieldCheck, Sparkles } from "lucide-react";
import { startLogin } from "../const";
import { trpc } from "../lib/trpc";

export default function Register() {
  const authQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  useEffect(() => {
    if (authQuery.data) window.location.replace("/");
  }, [authQuery.data]);

  return <main className="login-shell">
    <section className="login-visual"><div className="login-brand"><span className="login-brand-mark"><Network size={19} /></span><div><strong>NETPATH</strong><span>career ops / 01</span></div></div><div className="login-visual-content"><span className="eyebrow login-eyebrow"><span className="signal-pulse" /> PLATAFORMA DE CARREIRA EM REDES</span><h1>Comece sua rota para o <em>próximo nível.</em></h1><p>Crie seu espaço pessoal para organizar experiências, certificações, cursos e evidências técnicas.</p><div className="login-proof-list"><span><CheckCircle2 size={15} /> Perfil profissional privado</span><span><CheckCircle2 size={15} /> Nivelamento inicial guiado</span><span><CheckCircle2 size={15} /> Evolução salva na sua trilha</span></div></div><div className="login-visual-footer"><span>NIC.br / Cisco / Juniper / Huawei</span><span>NETPATH 2026</span></div></section>
    <section className="login-panel"><div className="login-panel-inner"><div className="login-mobile-brand"><span className="login-brand-mark"><Network size={18} /></span><strong>NETPATH</strong></div><div className="login-panel-heading"><span className="login-kicker"><Sparkles size={14} /> NOVO PERFIL</span><h2>Crie sua conta.</h2><p>O cadastro acontece na página oficial da Manus. Depois, você volta automaticamente para continuar sua jornada no NetPath.</p></div><div className="auth-mode-switch" role="tablist" aria-label="Acesso ao NetPath"><a href="/login">Entrar</a><a className="active" href="/register" aria-current="page">Criar conta</a></div><button className="login-primary" onClick={startLogin} disabled={authQuery.isLoading}>{authQuery.isLoading ? "Verificando sessão..." : <>Criar minha conta Manus <ArrowRight size={17} /></>}</button><div className="login-divider"><span>registro seguro</span></div><div className="login-security"><ShieldCheck size={18} /><div><strong>Cadastro protegido pela Manus</strong><span>Você será levado à página oficial da Manus para criar sua conta. O NetPath não armazena sua senha.</span></div></div><div className="login-return"><Route size={15} /><span>Após o cadastro, você voltará ao NetPath e poderá fazer o nivelamento para montar sua rota.</span></div><a className="login-back" href="/">Voltar para a página inicial</a></div></section>
  </main>;
}
