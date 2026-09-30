# Importação de catálogo

O catálogo manual do NetPath é versionado no Git e pode ser mantido sem Google Drive. O formato principal é JSON; CSV é uma alternativa prática para planilhas simples.

## JSON

Use `data/catalog/examples/catalog-import.example.json` como modelo. O arquivo deve conter:

- `version`: atualmente `1`;
- `sources`: fontes editoriais ou externas;
- `certifications`: certificações e seus pré-requisitos;
- `items`: cursos e eventos.

Os contratos ficam em `shared/catalog.ts` e são validados com Zod antes de qualquer persistência.

## CSV

Use `data/catalog/examples/certifications.example.csv` para cadastros tabulares. Os cabeçalhos mínimos são:

```text
id,sourceId,name,provider,level,roadmapStepId,status,url
```

Valores que contenham vírgula devem ficar entre aspas. O parser preserva vírgulas internas e rejeita linhas com quantidade incorreta de colunas.

## Regras editoriais

1. O `id` deve ser estável e não deve ser reutilizado para outra certificação.
2. `sourceId` identifica de onde o registro veio.
3. `roadmapStepId` conecta a certificação a uma etapa da trilha existente.
4. Atualizações devem preservar o histórico e indicar `updatedAt`.
5. Uma sincronização externa nunca deve sobrescrever uma edição manual sem prévia.
6. Registros encerrados devem ser arquivados ou marcados como `closed`, não apagados.

## Fluxo futuro na interface

1. Selecionar arquivo;
2. Validar formato;
3. Exibir novos itens, alterações e duplicidades;
4. Confirmar a importação;
5. Registrar histórico;
6. Atualizar catálogo e relações da trilha.
