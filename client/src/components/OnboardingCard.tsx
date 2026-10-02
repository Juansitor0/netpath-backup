import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LogIn, Sparkles, Target } from "lucide-react";
import { startLogin } from "../const";
import { roadmapSteps } from "../data/netpath";
import { trpc } from "../lib/trpc";

const quizQuestions: Array<{ id: string; label: string; options: Array<[number, string]> }> = [
  { id: "routing", label: "Quando uma rota falha, qual situação mais parece com você?", options: [[1, "Ainda preciso de um roteiro para investigar"], [2, "Consigo seguir comandos e encontrar a causa"], [3, "Consigo comparar hipóteses e explicar o impacto"], [4, "Oriento o time e proponho uma correção durável"]] },
  { id: "automation", label: "Qual cenário descreve melhor sua prática atual?", options: [[1, "Faço as mudanças manualmente"], [2, "Uso scripts ou ferramentas prontas com apoio"], [3, "Automatizo tarefas com API, Git ou Ansible"], [4, "Desenho padrões de automação para o time"]] },
];

const skillOptions = ["IPv4 / IPv6", "VLAN / STP", "OSPF / BGP", "Wireshark", "Python / APIs", "Ansible", "Junos", "Huawei"];
const levelLabels: Record<string, string> = { base: "Base", fundamentos: "Fundamentos", pleno: "Pleno", senior: "Sênior" };

export default function OnboardingCard() {
  const authQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const workspaceQuery = trpc.progress.workspace.useQuery(undefined, { enabled: Boolean(authQuery.data), retry: false });
  const [result, setResult] = useState<{ level: string; quizScore: number; nextStepId: string } | null>(null);
  const onboardingMutation = trpc.onboarding.complete.useMutation({ onSuccess: (data) => { setResult(data); workspaceQuery.refetch(); } });
  const [roleTitle, setRoleTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (!authQuery.data) return <section className="onboarding-card onboarding-guest"><div className="onboarding-icon"><LogIn size={20} /></div><div><span className="eyebrow">SALVE SUA JORNADA</span><h2>Transforme o mapa em uma rota pessoal.</h2><p>Entre com sua conta para salvar progresso, nivelar seu ponto de partida e receber uma próxima ação clara.</p></div><button className="primary-button" onClick={startLogin}>Entrar <ArrowRight size={15} /></button></section>;

  if (result) {
    const nextStep = roadmapSteps.find((step) => step.id === result.nextStepId);
    return <section className="onboarding-card onboarding-result"><div className="onboarding-icon"><Target size={20} /></div><div><span className="eyebrow">ROTA PERSONALIZADA PRONTA</span><h2>Você começa em {levelLabels[result.level] ?? result.level}.</h2><p>Seu primeiro foco é <strong>{nextStep?.title ?? "a próxima etapa da trilha"}</strong>. O NetPath já marcou essa etapa como seu próximo passo.</p><div className="onboarding-result-meta"><span><CheckCircle2 size={14} /> Nivelamento: {result.quizScore}/100</span><span><Sparkles size={14} /> Próximo passo definido</span></div><button className="primary-button" onClick={() => document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth" })}>Abrir minha trilha <ArrowRight size={15} /></button></div></section>;
  }

  if (workspaceQuery.data?.profile?.onboardingStatus === "completed") return null;

  const toggleSkill = (skill: string) => setSkills((current) => current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]);
  const submit = (event: FormEvent) => { event.preventDefault(); onboardingMutation.mutate({ roleTitle: roleTitle || undefined, yearsExperience: Number(yearsExperience) || 0, skills, quizAnswers: answers }); };

  return <section className="onboarding-card"><div className="onboarding-heading"><div className="onboarding-icon"><Sparkles size={20} /></div><div><span className="eyebrow">ONBOARDING / 01</span><h2>Vamos encontrar seu próximo passo.</h2><p>Leva menos de dois minutos. Escolha a opção mais próxima da sua realidade — não precisa lembrar tudo.</p></div></div><form onSubmit={submit} className="onboarding-form"><label>Cargo atual <span className="optional-label">opcional</span><input value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} placeholder="Ex.: Analista NOC" /></label><label>Experiência <span className="optional-label">opcional</span><select value={yearsExperience} onChange={(event) => setYearsExperience(event.target.value)}><option value="">Prefiro não informar</option>{Array.from({ length: 11 }, (_, index) => <option key={index} value={index}>{index === 0 ? "Ainda começando" : `${index} ${index === 1 ? "ano" : "anos"}`}</option>)}</select></label><div className="onboarding-wide"><span className="form-label">O que você já pratica?</span><div className="skill-picker">{skillOptions.map((skill) => <button type="button" key={skill} className={`skill-choice ${skills.includes(skill) ? "selected" : ""}`} onClick={() => toggleSkill(skill)}>{skills.includes(skill) ? "✓ " : "+ "}{skill}</button>)}</div></div><div className="onboarding-quiz onboarding-wide"><span className="mini-eyebrow">DUAS SITUAÇÕES PRÁTICAS</span>{quizQuestions.map((question) => <fieldset className="quiz-question" key={question.id}><legend>{question.label}</legend><div className="quiz-options">{question.options.map(([value, label]) => <label className={`quiz-option ${answers[question.id] === value ? "selected" : ""}`} key={value}><input type="radio" name={question.id} value={value} checked={answers[question.id] === value} onChange={() => setAnswers((current) => ({ ...current, [question.id]: value }))} /><span>{label}</span></label>)}</div></fieldset>)}</div><div className="onboarding-submit onboarding-wide"><span><CheckCircle2 size={14} /> Você poderá ajustar o nível depois.</span><button className="primary-button" type="submit" disabled={onboardingMutation.isPending}>{onboardingMutation.isPending ? "Montando sua rota..." : "Gerar minha rota"} <ArrowRight size={15} /></button></div>{onboardingMutation.error && <p className="onboarding-error">Não foi possível salvar agora. Tente novamente.</p>}</form></section>;
}
