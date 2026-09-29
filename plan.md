# Plano — NetPath

## Objetivo
Entregar um MVP interno, em português, que ajude profissionais de redes a visualizar e executar uma trajetória rumo ao nível sênior, conectando conhecimentos, certificações, pré-requisitos, progresso e conquistas.

## Escopo do MVP
- Navegação entre Visão geral, Trilha, Certificações e Conquistas.
- Dashboard com progresso geral, etapas concluídas, indicadores e próxima ação recomendada.
- Trilha visual do nível base ao sênior.
- Conteúdo inicial realista com fundamentos de redes, Cisco, Junos, HCI-Datacom e CNNA.
- Cards de certificação com fabricante, nível, pré-requisitos, status e ação.
- Filtros por fabricante, nível e status.
- Marcação local de etapas concluídas, com atualização imediata do dashboard.
- Achievements desbloqueados por marcos.
- Estrutura de dados desacoplada para futura autenticação, persistência e integração/exportação.

## Decisões de arquitetura
- **Frontend:** React + TypeScript + Vite do starter web-db-user.
- **Estado:** React state no cliente, com persistência opcional em localStorage para que o progresso sobreviva a refreshes nesta primeira versão.
- **Dados:** arrays tipados em módulo separado, sem acoplamento a componentes, facilitando futura substituição por API/banco.
- **Serving:** SPA/CSR estática, porque o conteúdo do MVP pode ser entregue como frontend e as interações são locais.
- **Build:** `pnpm build:static`, com saída em `dist/public` conforme o starter.
- **Rotas:** uma rota de aplicação (`/`) com navegação por estado interno; `manus-routes.json` declara `/`.
- **Cache:** assets versionados do build podem ser cacheados pelo host; HTML deve permanecer revalidável. Não há API dinâmica ou resposta privada no MVP.
- **Infra:** manter server e database desativados nesta etapa. Ativar depois somente quando login, múltiplos perfis ou sincronização forem implementados.

## Estrutura de arquivos
- `client/src/pages/Home.tsx`: shell da aplicação, navegação e composição de seções.
- `client/src/data/netpath.ts`: tipos e conteúdo inicial da trilha, certificações e conquistas.
- `client/src/index.css`: tokens de cor, tipografia, layout responsivo e componentes visuais do produto.
- `client/public/manus-routes.json`: manifesto de rotas da aplicação.
- `logo.png` e `app.config.ts`: branding do projeto e sincronização do logo.

## Validação
- `pnpm check` para validar TypeScript.
- `pnpm build:static` para verificar a build publicada do frontend.
- Servidor `pnpm dev:static` no port 3000 e request HTTP a `/` e `/manus-routes.json`.
- Inspeção de código para verificar que filtros, progresso, recomendações e achievements usam a mesma fonte de estado.
