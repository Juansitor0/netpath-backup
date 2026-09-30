# Arquitetura do NetPath

## Princípio

O NetPath separa **conteúdo editorial**, **fontes externas** e **experiência da trilha**. A interface atual continua leve e funcional enquanto os contratos já preparam a migração para uma API e um banco.

## Camadas

```text
client/                 Experiência, dashboard e navegação
shared/catalog.ts       Tipos e validações que atravessam as camadas
data/catalog/           Arquivos versionados para backup e importação manual
server/catalog/         Adaptadores, normalização e sincronização futura
server/routers.ts       API tRPC futura para catálogo e progresso
drizzle/schema.ts       Persistência futura no banco gerenciado
```

## Fluxo de catálogo

```text
Fonte pública ou arquivo manual
        ↓
Adapter / parser
        ↓
Validação Zod
        ↓
Prévia de novos itens, alterações e duplicidades
        ↓
Confirmação editorial
        ↓
API + banco
        ↓
Trilha e recomendações
```

Nenhum adaptador deve escrever diretamente no frontend. A fonte externa pode sugerir dados; a etapa de confirmação controla o que entra no catálogo oficial.

## Estado da implementação

- **Agora:** contratos, exemplos e registro do NIC.br estão versionados.
- **Próxima etapa:** ativar backend e banco, criar migrations e tela de importação.
- **Depois:** sincronização diária e detecção de alterações.

A habilitação do banco gerenciado é uma capacidade permanente do projeto. Por isso ela fica separada desta etapa de organização.
