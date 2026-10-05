import { useEffect } from "react";
import { ArrowRight, CheckCircle2, Network, Route, ShieldCheck, Sparkles } from "lucide-react";
import { startLogin } from "../const";
import { trpc } from "../lib/trpc";

export default function Login() {
  const authQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  useEffect(() => {
    if (authQuery.data) window.location.replace("/");
  }, [authQuery.data]);

  return <main className="login-shell"><section className="login-visual"><div className="login-brand"><span className="login-brand-mark"><Network size={19} /></span><div><strong>NETPATH</strong><span>career ops / 01</span></div></div><div className="login-visual-content"><span className="eyebrow login-eyebrow"><span className="signal-pulse" /> PLATAFORMA DE CARREIRA EM REDES</span><h1>Transforme experiência em <em>próximo nível.</em></h1><p>Uma rota clara para estudar, praticar, validar certificações e construir evidências técnicas até a senioridade.</p><div className="login-proof-list"><span><CheckCircle2 size={15} /> Trilha com dependências reais</span><span><CheckCircle2 size={15} /> Cursos e eventos no mesmo lugar</span><span><CheckCircle2 size={15} /> Progresso salvo no seu perfil</span></div></div><div className="login-visual-footer"><span>NIC.br / Cisco / Juniper / Huawei</span><span>NETPATH 2026</span></div></section><section className="login-panel"><div className="login-panel-inner"><div className="login-mobile-brand"><span className="login-brand-mark"><Network size={18} /></span><strong>NETPATH</strong></div><div className="login-panel-heading"><span className="login-kicker"><Sparkles size={14} /> SUA JORNADA</span><h2>Entre para continuar.</h2><p>Use sua conta Manus para salvar o nivelamento, acompanhar a trilha e receber recomendações personalizadas.</p></div><button className="login-primary" onClick={startLogin} disabled={authQuery.isLoading}>{authQuery.isLoading ? "Verificando sessão..." : <>Entrar com minha conta <ArrowRight size={17} /></>}</button><div className="login-divider"><span>acesso seguro</span></div><div className="login-security"><ShieldCheck size={18} /><div><strong>Seus dados ficam protegidos</strong><span>O login acontece na página oficial da Manus. O NetPath não armazena sua senha.</span></div></div><div className="login-return"><Route size={15} /><span>Primeira vez aqui? Depois do login, você fará um nivelamento rápido para montar sua rota.</span></div><a className="login-back" href="/">Voltar para a página inicial</a></div></section></main>;
}
