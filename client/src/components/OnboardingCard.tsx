import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LogIn, Sparkles } from "lucide-react";
import { startLogin } from "../const";
import { trpc } from "../lib/trpc";

const quizQuestions = [
  { id: "routing", label: "Consigo explicar como uma rota é escolhida e investigar um problema de OSPF.", value: 1 },
  { id: "automation", label: "Já automatizei uma tarefa de rede usando script, API, Git ou Ansible.", value: 1 },
  { id: "design", label: "Consigo justificar decisões de arquitetura considerando resiliência e trade-offs.", value: 1 },
];

export default function OnboardingCard() {
  const authQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const workspaceQuery = trpc.progress.workspace.useQuery(undefined, { enabled: Boolean(authQuery.data), retry: false });
  const onboardingMutation = trpc.onboarding.complete.useMutation({ onSuccess: () => workspaceQuery.refetch() });
  const [roleTitle, setRoleTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState("0");
  const [skills, setSkills] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (!authQuery.data) {
    return <section className="onboarding-card onboarding-guest"><div className="onboarding-icon"><LogIn size={20} /></div><div><span className="eyebrow">SALVE SUA JORNADA</span><h2>Transforme o mapa em uma rota pessoal.</h2><p>Entre com sua conta para salvar progresso, fazer o nivelamento e receber recomendações baseadas no seu perfil.</p></div><button className="primary-button" onClick={startLogin}>Entrar <ArrowRight size={15} /></button></section>;
  }

  if (workspaceQuery.data?.profile?.onboardingStatus === "completed") return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onboardingMutation.mutate({
      roleTitle: roleTitle || undefined,
      yearsExperience: Number(yearsExperience) || 0,
      skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      quizAnswers: answers,
    });
  };

  return <section className="onboarding-card"><div className="onboarding-heading"><div className="onboarding-icon"><Sparkles size={20} /></div><div><span className="eyebrow">ONBOARDING / 01</span><h2>Vamos posicionar sua rota.</h2><p>Responda o essencial. O nível sugerido é transparente e você pode confirmar ou ajustar.</p></div></div><form onSubmit={submit} className="onboarding-form"><label>Cargo atual<input value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} placeholder="Ex.: Analista NOC" /></label><label>Anos de experiência<input type="number" min="0" max="60" value={yearsExperience} onChange={(event) => setYearsExperience(event.target.value)} /></label><label className="onboarding-wide">Tecnologias que já conhece<input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Ex.: IPv4, OSPF, VLAN, Python" /><small>Separe por vírgulas.</small></label><div className="onboarding-quiz onboarding-wide"><span className="mini-eyebrow">AUTOAVALIAÇÃO RÁPIDA</span>{quizQuestions.map((question) => <label className="quiz-row" key={question.id}><span>{question.label}</span><select value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: Number(event.target.value) }))}><option value="">Ainda não</option><option value="1">Tenho contato</option><option value="2">Consigo executar</option><option value="3">Consigo explicar</option><option value="4">Consigo orientar alguém</option><option value="5">Domino em produção</option></select></label>)}</div><div className="onboarding-submit onboarding-wide"><span><CheckCircle2 size={14} /> Seus dados ficam vinculados somente ao seu perfil.</span><button className="primary-button" type="submit" disabled={onboardingMutation.isPending}>{onboardingMutation.isPending ? "Calculando..." : "Calcular minha rota"} <ArrowRight size={15} /></button></div>{onboardingMutation.error && <p className="onboarding-error">Não foi possível salvar agora. Tente novamente.</p>}</form></section>;
}
