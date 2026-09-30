# Catálogo versionado

Esta pasta é a fonte de backup e edição manual do catálogo enquanto a persistência do produto ainda não foi habilitada.

- `sources.json`: fontes conhecidas e suas políticas;
- `certifications.json`: certificações estratégicas da trilha;
- `examples/`: modelos de importação para novos registros.

Use nomes estáveis, mantenha `version: 1` e registre mudanças relevantes no commit. Dados encontrados automaticamente não devem ser misturados com exemplos: eles passarão pelo adaptador e pela prévia de importação na próxima fase.
