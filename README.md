# NetPath

**NetPath** é um cockpit pessoal para profissionais de redes planejarem a evolução até a senioridade. A trilha conecta fundamentos, prática, certificações, cursos, fontes externas e evidências de progresso.

## Foco deste repositório

Este repositório guarda o código do site, a documentação da arquitetura e os arquivos de catálogo que podem ser editados manualmente. O objetivo é manter uma fonte clara, revisável e fácil de recuperar — sem usar o Google Drive como banco principal.

A interface atual já possui dashboard, trilha de dependências, certificações, filtros, progresso local e achievements. A estrutura de catálogo foi preparada para a próxima etapa: importação por JSON/CSV, persistência e monitoramento de fontes como o NIC.br.

## Estrutura de pastas

```text
client/                 Interface React, páginas e estilos
  public/               Arquivos públicos e manifesto de rotas
  src/data/             Dados locais do MVP
  src/pages/            Telas do produto
  src/components/       Componentes reutilizáveis
shared/                 Contratos compartilhados entre frontend e backend
server/                 Backend Express/tRPC
  catalog/              Adaptadores e normalizadores de fontes externas
data/catalog/           Catálogo editorial versionado e exemplos de importação
docs/                   Arquitetura, operação manual e integrações
  integrations/         Documentação específica por fonte externa
drizzle/                Schema e migrations do banco futuro
```

## Como trabalhar manualmente

### Alterar uma certificação

Edite `data/catalog/certifications.json`. Preserve o `id` existente, ajuste `description`, `prerequisites`, `topics`, `roadmapStepId` e `updatedAt`, e faça um commit descrevendo a mudança.

### Adicionar uma certificação

Copie o formato de `data/catalog/examples/certifications.example.csv` ou adicione um registro em `data/catalog/certifications.json`. Use um `id` estável, informe `sourceId: "manual"`, escolha um nível válido e conecte a certificação a uma etapa existente por `roadmapStepId` quando fizer sentido.

### Adicionar um curso ou evento

Use `data/catalog/examples/catalog-import.example.json` como modelo. Registre o provedor, a URL oficial, modalidade, período de inscrição, datas, tópicos e certificações relacionadas. Cursos encontrados em fontes externas devem passar por revisão antes de entrar no catálogo oficial.

### Adicionar uma nova fonte

Registre a fonte em `data/catalog/sources.json`, documente-a em `docs/integrations/` e crie um adaptador isolado em `server/catalog/`. Não coloque regras de scraping ou normalização dentro dos componentes React.

## Comandos principais

```bash
pnpm install
pnpm dev:static       # Preview do MVP atual na porta 3000
pnpm dev              # Servidor completo Express + Vite
pnpm check            # TypeScript
pnpm test             # Testes de contratos e parsers
pnpm build:static     # Build do frontend em dist/public
pnpm build            # Build frontend + backend
```

Antes de enviar alterações, rode `pnpm check`, `pnpm test` e `pnpm build:static`.

## Regras de organização

1. Dados editoriais ficam em `data/catalog/`, não dentro de componentes.
2. Tipos e validações compartilhados ficam em `shared/`.
3. Cada fonte externa tem seu próprio módulo em `server/catalog/`.
4. Não salve chaves de API, tokens ou senhas no Git.
5. Não apague registros encerrados: marque-os como arquivados ou fechados.
6. Não sobrescreva edição manual durante uma sincronização automática sem uma prévia e confirmação.
7. Use commits pequenos e descritivos.

## Fluxo recomendado de commit

```bash
git status
git add README.md docs data shared server/catalog plan.md
git commit -m "docs: organize catalog structure"
git push origin main
git push github-backup main
```

O `origin` gerenciado pela Manus continua sendo o repositório principal. O remoto `github-backup` aponta para o repositório privado de backup no GitHub.

## Documentação

- [`docs/architecture.md`](docs/architecture.md): arquitetura e fases do produto.
- [`docs/catalog-import.md`](docs/catalog-import.md): formato JSON/CSV e regras de importação.
- [`docs/manual-update.md`](docs/manual-update.md): checklist para alterações manuais.
- [`docs/integrations/nicbr.md`](docs/integrations/nicbr.md): primeira fonte externa planejada.
- [`docs/deployment-github-pages.md`](docs/deployment-github-pages.md): publicação automática e limites do GitHub Pages.
- [`data/catalog/README.md`](data/catalog/README.md): finalidade dos arquivos versionados.

## Próxima fase

A versão atual já possui backend Express/tRPC, banco MySQL gerenciado, migration, seed das certificações e tela de catálogo. O deploy principal usa frontend estático + API no mesmo domínio: `/api/*` chega ao container e os assets chegam ao host estático.

O GitHub Pages continua disponível para uma cópia estática do MVP, publicada pelo workflow em `.github/workflows/deploy-pages.yml`. Ele não substitui o backend: importação persistente, login, banco e sincronização NIC.br continuam dependendo de um servidor. A próxima evolução é implementar a sincronização diária da agenda pública do NIC.br.
