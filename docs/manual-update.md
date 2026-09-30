# Checklist de atualização manual

Use este fluxo quando quiser cadastrar ou corrigir algo sem esperar a tela de importação ficar pronta.

## Antes de editar

1. Atualize sua cópia local e confirme que está na branch `main`.
2. Consulte `data/catalog/README.md` e o contrato em `shared/catalog.ts`.
3. Escolha um `id` estável e não reutilize o ID de outro registro.

## Durante a edição

1. Certificações entram em `data/catalog/certifications.json`.
2. Fontes entram em `data/catalog/sources.json`.
3. Cursos e eventos de exemplo entram em um arquivo JSON seguindo o modelo em `data/catalog/examples/`.
4. Integrações e decisões entram em `docs/`.
5. Atualize `updatedAt` no formato `AAAA-MM-DD`.
6. Mantenha URLs oficiais e não registre tokens ou credenciais.

## Antes do commit

```bash
pnpm check
pnpm test
pnpm build:static
git diff --check
git status
```

Se algum comando falhar, corrija antes do commit. Para documentação pura, `pnpm check` e `pnpm build:static` ainda são úteis para garantir que a organização não quebrou o projeto.

## Commit e backup

```bash
git add data/catalog docs shared server/catalog README.md plan.md
git commit -m "catalog: describe the change"
git push origin main
git push github-backup main
```

Depois confirme o commit no GitHub privado. O backup não substitui o repositório principal gerenciado pela Manus.

## O que não fazer

Não edite o catálogo diretamente dentro de `Home.tsx`, não apague cursos antigos para corrigir datas e não force-push nenhuma branch. Quando a tela de importação estiver pronta, a prévia substituirá este fluxo manual.
