# Publicação no GitHub Pages

## GitHub Pages é suficiente agora?

Sim. O MVP atual é uma aplicação React/Vite estática: o progresso usa `localStorage`, a navegação ocorre no navegador e não há banco nem API obrigatória para abrir a página. O GitHub Pages consegue servir essa versão com deploy automático via GitHub Actions.

Ele deixa de ser suficiente quando o NetPath passar a depender de backend para login, banco, importação persistente, sincronização diária do NIC.br ou notificações. Nessa fase, o frontend pode continuar no GitHub Pages, mas a API precisará ficar hospedada separadamente — ou o site completo poderá voltar a ser publicado em uma plataforma com servidor.

## Como funciona

O workflow `.github/workflows/deploy-pages.yml` executa quando há push na branch `main`:

1. instala as dependências com pnpm 10.18.0;
2. executa `pnpm build:static`;
3. publica `dist/public` como artefato do GitHub Pages;
4. disponibiliza o site na URL do repositório.

O `vite.config.ts` usa `/netpath-backup/` como base somente no GitHub Actions. No preview local e na Manus, a base continua `/`.

## Ativação única no GitHub

Depois que o código estiver no repositório privado:

1. abra **Settings → Pages**;
2. em **Build and deployment**, selecione **GitHub Actions**;
3. aguarde o workflow `Deploy NetPath to GitHub Pages` terminar;
4. use a URL exibida no ambiente `github-pages`.

A publicação será automática a cada push em `main`, sem precisar clicar em Publish na Manus.

## Limite importante

O GitHub Pages publica somente arquivos estáticos. O workflow não executa Express, tRPC, Drizzle, banco ou rotinas agendadas. A estrutura de catálogo preparada em `data/catalog/` continua útil como backup e edição manual, mas a importação funcional e o monitoramento NIC.br entrarão quando houver um backend.
