# Acesso ao banco e publicação

## Decisão oficial

O NetPath usa a seguinte arquitetura:

```text
Usuário
  ↓
Frontend React/Vite estático
  ↓ /api/*
Backend Express + tRPC
  ↓
Drizzle ORM
  ↓
MySQL gerenciado pela Manus
```

A aplicação publicada está em:

- Site: <https://netpath-4ibszbak.manus.space>
- API: mesma origem, em `/api/*`
- Health check: `/api/health`
- Banco: MySQL gerenciado e privado do projeto
- Código principal: repositório gerenciado pela Manus
- Backup: <https://github.com/Juansitor0/netpath-backup>

O GitHub Pages é mantido como opção para o frontend estático, mas não executa o backend, o tRPC nem o banco. A versão completa deve usar o deploy híbrido da Manus ou outro provedor capaz de executar Node.js e conectar-se a MySQL.

## Como o banco é acessado

A conexão utiliza a variável privada `DATABASE_URL`. Ela é fornecida pelo ambiente do servidor e não deve aparecer no frontend, no GitHub, em documentação, logs ou mensagens.

No código, o acesso começa em `server/db.ts`:

```ts
const db = await getDb();
```

As consultas específicas ficam separadas por domínio. O catálogo, por exemplo, usa `server/catalog/repository.ts`. O navegador nunca recebe a URL de conexão nem executa SQL diretamente.

O banco é compartilhado entre o ambiente de desenvolvimento gerenciado e a publicação. Portanto, uma migration aplicada pelo comando de desenvolvimento altera a estrutura utilizada pelo site publicado. Isso torna obrigatório revisar e testar migrations antes de executá-las. A migration atual já inclui `user_profiles`, `onboarding_sessions` e `user_progress`.

## Onde criar tabelas

1. Edite `drizzle/schema.ts`.
2. Defina as colunas, enums, índices e relações.
3. Crie funções de consulta em `server/` no módulo do domínio.
4. Exponha somente procedures tRPC necessárias em `server/routers.ts`.
5. Rode `pnpm check`.
6. Gere e aplique a migration com `pnpm db:push`.
7. Verifique os testes e o endpoint afetado.
8. Faça commit do schema, da migration e do código.
9. Envie para `origin` e `github-backup`.
10. Publique somente quando a versão estiver validada.

Exemplo de fluxo:

```bash
# DATABASE_URL é carregada pelo ambiente autorizado; nunca cole o valor no terminal compartilhado.
pnpm check
pnpm db:push
pnpm test -- --run
pnpm build
git add drizzle server shared client
git commit -m "feat: add user progress tables"
git push origin main
git push github-backup main:main
```

`pnpm db:push` gera a migration em `drizzle/` e aplica a alteração. `pnpm db:migrate` aplica migrations já geradas e versionadas. Não use SQL destrutivo ou `DROP TABLE` sem revisar o impacto e obter aprovação explícita.

## Como o usuário acessa os dados

O acesso normal deve acontecer pela aplicação:

- consulta pública: procedures de leitura, como `catalog.list`;
- operação administrativa: procedures protegidas por `adminProcedure`;
- importação: tela Catálogo → Importar JSON;
- histórico: tabela `catalog_imports` e futura tela administrativa.

Não será criado um endpoint público de SQL nem uma página que exiba `DATABASE_URL`. Para administração avançada, o caminho seguro é criar telas e procedures específicas, com autenticação e permissões.

## IA e dados

A IA não deve ser a dona da consistência do banco. O núcleo deve permanecer determinístico:

- migrations e constraints garantem a estrutura;
- schemas Zod validam payloads;
- adaptadores normalizam fontes externas;
- regras calculam dependências e progresso;
- procedures protegem operações administrativas.

Um agente de IA pode ser adicionado depois para interpretar perfil, sugerir buscas, resumir cursos e explicar o próximo salto. A IA deverá chamar ferramentas internas limitadas, nunca receber `DATABASE_URL` e nunca gravar diretamente sem validação, prévia e confirmação quando a ação alterar dados.

## Estratégia para o futuro

O onboarding e o progresso já usam `user_profiles`, `onboarding_sessions` e `user_progress`. As próximas tabelas serão `roadmap_nodes`, `roadmap_dependencies`, `labs`, `achievements` e `user_achievements`. O cálculo do “Próximo Salto” usará primeiro regras persistentes; a IA entrará como camada de recomendação e explicação, não como substituta das regras.
