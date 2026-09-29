export type StageId = "base" | "fundamentos" | "especialista" | "avancado";
export type StepStatus = "done" | "in-progress" | "locked";
export type ViewId = "overview" | "roadmap" | "certifications" | "achievements";

export type RoadmapStep = {
  id: string;
  title: string;
  stage: StageId;
  stageLabel: string;
  eyebrow: string;
  description: string;
  duration: string;
  kind: "knowledge" | "certification" | "project";
  vendor: string;
  dependencies: string[];
  tags: string[];
};

export type Certification = {
  id: string;
  name: string;
  vendor: string;
  level: "Base" | "Intermediário" | "Avançado";
  accent: "cisco" | "juniper" | "huawei" | "target";
  tagline: string;
  description: string;
  stepId: string;
  prerequisites: string[];
  exam: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  threshold: number;
  icon: "signal" | "route" | "stack" | "star" | "target";
};

export const roadmapSteps: RoadmapStep[] = [
  {
    id: "fundamentos",
    title: "Fundamentos de redes",
    stage: "base",
    stageLabel: "Base",
    eyebrow: "01 · BASE",
    description: "OSI, TCP/IP, Ethernet, endereçamento e leitura de topologias.",
    duration: "4–6 semanas",
    kind: "knowledge",
    vendor: "Essencial",
    dependencies: [],
    tags: ["OSI / TCP-IP", "IPv4 e IPv6"],
  },
  {
    id: "subnetting",
    title: "Subnetting & endereçamento",
    stage: "base",
    stageLabel: "Base",
    eyebrow: "02 · BASE",
    description: "Sub-redes, VLSM e planejamento de endereços sem depender de calculadora.",
    duration: "2–3 semanas",
    kind: "knowledge",
    vendor: "Essencial",
    dependencies: ["fundamentos"],
    tags: ["VLSM", "CIDR"],
  },
  {
    id: "switching",
    title: "Switching & VLANs",
    stage: "fundamentos",
    stageLabel: "Fundamentos",
    eyebrow: "03 · FUNDAMENTOS",
    description: "Domine VLANs, trunks, STP e o comportamento do switch em produção.",
    duration: "3–4 semanas",
    kind: "knowledge",
    vendor: "Cisco",
    dependencies: ["subnetting"],
    tags: ["VLAN", "STP", "Trunk"],
  },
  {
    id: "routing",
    title: "Routing essencial",
    stage: "fundamentos",
    stageLabel: "Fundamentos",
    eyebrow: "04 · FUNDAMENTOS",
    description: "Rotas estáticas, OSPF básico e troubleshooting orientado por evidências.",
    duration: "4 semanas",
    kind: "knowledge",
    vendor: "Cisco",
    dependencies: ["switching"],
    tags: ["OSPF", "Troubleshooting"],
  },
  {
    id: "cisco-basics",
    title: "Cisco Networking Basics",
    stage: "fundamentos",
    stageLabel: "Fundamentos",
    eyebrow: "05 · CERTIFICAÇÃO",
    description: "Primeiro marco formal para validar a base de redes e operações Cisco.",
    duration: "6–8 semanas",
    kind: "certification",
    vendor: "Cisco",
    dependencies: ["routing"],
    tags: ["Cisco", "Entry level"],
  },
  {
    id: "junos",
    title: "JNCIA-Junos",
    stage: "especialista",
    stageLabel: "Especialista",
    eyebrow: "06 · ALTERNATIVA",
    description: "Uma segunda perspectiva de operação: Junos, hierarquia de configuração e commit.",
    duration: "6 semanas",
    kind: "certification",
    vendor: "Juniper",
    dependencies: ["routing"],
    tags: ["Junos", "Routing"],
  },
  {
    id: "hcia",
    title: "HCIA-Datacom",
    stage: "especialista",
    stageLabel: "Especialista",
    eyebrow: "07 · ALTERNATIVA",
    description: "Amplie o repertório com uma trilha de datacom e fundamentos de redes Huawei.",
    duration: "6–8 semanas",
    kind: "certification",
    vendor: "HCI-Datacom",
    dependencies: ["routing"],
    tags: ["Datacom", "Huawei"],
  },
  {
    id: "automation",
    title: "Automação para redes",
    stage: "especialista",
    stageLabel: "Especialista",
    eyebrow: "08 · ESPECIALISTA",
    description: "Python, APIs, Git e Ansible para transformar tarefas repetitivas em sistemas.",
    duration: "5–6 semanas",
    kind: "knowledge",
    vendor: "Multivendor",
    dependencies: ["cisco-basics"],
    tags: ["Python", "APIs", "Ansible"],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting avançado",
    stage: "avancado",
    stageLabel: "Avançado",
    eyebrow: "09 · AVANÇADO",
    description: "Método de diagnóstico, captura de pacotes e incidentes com múltiplas camadas.",
    duration: "4–5 semanas",
    kind: "project",
    vendor: "Multivendor",
    dependencies: ["junos", "automation"],
    tags: ["Wireshark", "RCA"],
  },
  {
    id: "design",
    title: "Design de redes",
    stage: "avancado",
    stageLabel: "Avançado",
    eyebrow: "10 · AVANÇADO",
    description: "Capacidade, resiliência, segurança e decisões de arquitetura documentadas.",
    duration: "6 semanas",
    kind: "project",
    vendor: "Multivendor",
    dependencies: ["troubleshooting"],
    tags: ["HLD / LLD", "Resiliência"],
  },
  {
    id: "cnna",
    title: "CNNA · trilha alvo",
    stage: "avancado",
    stageLabel: "Avançado",
    eyebrow: "11 · CERTIFICAÇÃO-ALVO",
    description: "A certificação avançada da sua rota. Chegue com fundamentos, operação e projeto validados.",
    duration: "8–12 semanas",
    kind: "certification",
    vendor: "Trilha alvo",
    dependencies: ["design"],
    tags: ["CNNA", "Senior track"],
  },
  {
    id: "capstone",
    title: "Projeto de arquitetura real",
    stage: "avancado",
    stageLabel: "Avançado",
    eyebrow: "12 · MARCO SÊNIOR",
    description: "Desenhe, implemente e apresente uma solução completa com trade-offs explícitos.",
    duration: "8 semanas",
    kind: "project",
    vendor: "Multivendor",
    dependencies: ["cnna"],
    tags: ["Portfólio", "Apresentação"],
  },
];

export const certifications: Certification[] = [
  {
    id: "cert-cisco",
    name: "Cisco Networking Basics",
    vendor: "Cisco",
    level: "Base",
    accent: "cisco",
    tagline: "A primeira validação formal da base.",
    description: "Uma boa porta de entrada para consolidar fundamentos, switching e routing.",
    stepId: "cisco-basics",
    prerequisites: ["Fundamentos de redes", "Subnetting", "Routing essencial"],
    exam: "6–8 semanas",
  },
  {
    id: "cert-junos",
    name: "JNCIA-Junos",
    vendor: "Juniper",
    level: "Intermediário",
    accent: "juniper",
    tagline: "Pense em redes além de um único fabricante.",
    description: "Uma alternativa consistente para quem quer entender Junos e operações multivendor.",
    stepId: "junos",
    prerequisites: ["Fundamentos de redes", "Routing essencial"],
    exam: "6 semanas",
  },
  {
    id: "cert-hcia",
    name: "HCIA-Datacom",
    vendor: "HCI-Datacom",
    level: "Intermediário",
    accent: "huawei",
    tagline: "Amplie o mapa com uma trilha de datacom.",
    description: "Certificação alternativa para praticar conceitos de routing, switching e operação.",
    stepId: "hcia",
    prerequisites: ["Fundamentos de redes", "Routing essencial"],
    exam: "6–8 semanas",
  },
  {
    id: "cert-cnna",
    name: "CNNA",
    vendor: "Trilha alvo",
    level: "Avançado",
    accent: "target",
    tagline: "O próximo grande salto da sua jornada.",
    description: "A etapa avançada que conecta base técnica, experiência operacional e visão de arquitetura.",
    stepId: "cnna",
    prerequisites: ["Automação para redes", "Troubleshooting avançado", "Design de redes"],
    exam: "8–12 semanas",
  },
];

export const achievements: Achievement[] = [
  { id: "signal", title: "Primeiro sinal", description: "Conclua sua primeira etapa da rota.", threshold: 1, icon: "signal" },
  { id: "base", title: "Base validada", description: "Complete os três pilares fundamentais.", threshold: 3, icon: "route" },
  { id: "multivendor", title: "Pensamento multivendor", description: "Ative uma rota alternativa além da Cisco.", threshold: 6, icon: "stack" },
  { id: "specialist", title: "Especialista em formação", description: "Passe da metade da trilha.", threshold: 7, icon: "star" },
  { id: "senior", title: "Senior track", description: "Conclua a trilha completa até o projeto final.", threshold: roadmapSteps.length, icon: "target" },
];

export const stageMeta: Record<StageId, { title: string; subtitle: string; color: string }> = {
  base: { title: "Base", subtitle: "A linguagem comum das redes", color: "mint" },
  fundamentos: { title: "Fundamentos", subtitle: "Operação com confiança", color: "cyan" },
  especialista: { title: "Especialista", subtitle: "Profundidade e repertório", color: "amber" },
  avancado: { title: "Avançado", subtitle: "Arquitetura e senioridade", color: "coral" },
};

export const initialCompleted: Record<string, boolean> = {
  fundamentos: true,
  subnetting: true,
  switching: true,
};
