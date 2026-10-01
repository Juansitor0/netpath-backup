# Plano — NetPath

## Objetivo
Entregar um produto interno, em português, que ajude profissionais de redes a construir uma trajetória rumo ao nível sênior, conectando conhecimentos, certificações, cursos, pré-requisitos, progresso e conquistas.

## Estado atual
O MVP visual já está funcional com dashboard, trilha, certificações, filtros, progresso local e achievements. A organização do catálogo foi concluída e o projeto agora possui servidor e banco gerenciados habilitados, com API tRPC, migration persistente, seed inicial e tela de catálogo.

## Fase 1 — Organização e contratos de catálogo
- Reorganizar a documentação do repositório em `docs/`.
- Criar um contrato tipado e validável para cursos, eventos, certificações, fontes e importações.
- Criar exemplos JSON/CSV para manutenção manual sem Google Drive.
- Registrar o NIC.br como primeira fonte externa, usando as páginas públicas oficiais como origem inicial.
- Criar uma interface de adaptadores para que Cisco, Juniper, Huawei e outras fontes possam ser adicionadas sem misturar regras no frontend.
- Manter o frontend atual funcionando com seus dados locais enquanto a persistência ainda não foi habilitada.

## Fase 2 — Persistência e importação no produto
- Servidor e banco gerenciados habilitados de forma permanente após aprovação da estrutura de catálogo.
- Criar tabelas para fontes, itens de catálogo, certificações, relações com a trilha, importações e sincronizações.
- Expor API para listagem, prévia, validação, confirmação e histórico de importações JSON/CSV.
- Persistir perfil, onboarding e progresso por usuário, mantendo fallback local quando não houver sessão.
- Migrar o estado de progresso e catálogo local para a API sem perder o comportamento atual.

## Fase 3 — Monitoramento do NIC.br
- Implementar um adaptador determinístico para a agenda pública do NIC.br.
- Normalizar cursos, eventos e períodos de inscrição.
- Adicionar botão de sincronização manual e rotina diária no backend publicado.
- Detectar novos itens e alterações sem sobrescrever edições editoriais manuais.
- Usar endpoints internos somente após validação técnica e apenas como fallback, pois podem mudar sem aviso.

## Entrega funcional atual

- `user_profiles`, `onboarding_sessions` e `user_progress` já estão no banco.
- `progress.workspace` lê o perfil e o progresso do usuário autenticado.
- `progress.set` salva cada checkpoint concluído ou reaberto.
- `onboarding.complete` calcula um nível inicial determinístico a partir de experiência, skills e autoavaliação.
- A dashboard hidrata o progresso remoto quando existe sessão; sem sessão, mantém o comportamento local.

## Decisões de arquitetura
- **Frontend:** React + TypeScript + Vite do starter web-db-user.
- **Contratos:** tipos e schemas compartilhados em `shared/catalog.ts`, usados por importadores e futuramente pela API.
- **Estado atual:** React state e localStorage para progresso no MVP; o catálogo de integração começa versionado em arquivos.
- **Serving:** frontend SPA/CSR estático + backend Express/tRPC em `/api/*` para dados dinâmicos, no mesmo domínio publicado.
- **Persistência:** MySQL gerenciado com Drizzle; o banco de desenvolvimento/publicação compartilha os dados e a habilitação é one-way.
- **Fontes externas:** cada fonte possui um adaptador isolado; o NIC.br começa por agenda pública, sem presumir uma API REST pública ou RSS não confirmado.
- **Cache:** assets versionados com cache imutável; HTML com fallback de SPA; APIs de catálogo sem cache compartilhado enquanto houver dados mutáveis.
- **Deploy:** Dockerfile para Express + build estático `dist/public`; `/api/*` vai para o servidor e demais páginas para o host estático.
- **Backup:** GitHub privado `Juansitor0/netpath-backup` permanece como cópia externa, sem substituir o repositório gerenciado principal.

## Estrutura de arquivos
- `client/src/pages/Home.tsx`: shell atual da aplicação e navegação.
- `client/src/data/netpath.ts`: conteúdo local inicial da trilha, certificações e conquistas.
- `client/src/index.css`: tokens, tipografia e layout visual.
- `shared/catalog.ts`: contrato comum para importação, fontes e itens de catálogo.
- `server/catalog/`: parsers, normalizadores e adaptadores de fontes externas.
- `data/catalog/`: arquivos versionados de referência e exemplos de importação.
- `docs/`: decisões de arquitetura, formato de importação e documentação de integrações.
- `client/public/manus-routes.json`: manifesto de rotas da aplicação.
- `app.config.ts` e arquivos `netpath-logo.*`: branding e metadados do projeto.

## Validação
- `pnpm check` para validar TypeScript.
- `pnpm test` para validar schemas e parsers de catálogo.
- `pnpm build:static` para verificar a build atual do frontend.
- Requests HTTP a `/` e `/manus-routes.json` quando o preview estiver em execução.
- Inspeção de código para garantir que importadores não sobrescrevem dados sem uma etapa explícita de confirmação.
