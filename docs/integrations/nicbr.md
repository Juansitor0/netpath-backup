
## Uso no produto

A aba **Novidades & oportunidades** lê os itens persistidos do catálogo e permite filtrar por curso ou evento. Cada item pode mostrar status de inscrição, data, provedor, descrição, link oficial e relação com a rota técnica.

Fontes oficiais atuais:

- [Agenda Cursos e Eventos](https://cursoseventos.nic.br/agenda)
- [Semana de Capacitação](https://semanacap.bcp.nic.br/)
- [NIC.br Notícias](https://nic.br/noticias/indice/)
- [Intra Rede](https://intrarede.nic.br/)

## Estratégia de integração

O portal de agenda é uma página HTML pública, não uma API REST documentada. Por isso o NetPath não faz chamadas diretas do navegador nem trata endpoints internos como contrato estável.

Uma rotina de sincronização deve:

1. buscar a página oficial no backend;
2. extrair apenas campos públicos e necessários;
3. validar cada candidato com Zod;
4. gerar um ID estável por fonte + identificador/título;
5. preservar alterações manuais (`isManualOverride`);
6. registrar `catalog_sync_runs`;
7. mostrar a prévia antes de aplicar alterações.

Até o parser automático estar validado, a entrada oficial pode ser revisada e importada pelo JSON versionado. Isso evita gravar HTML quebrado ou depender silenciosamente de uma estrutura interna que pode mudar.

## Recomendação futura

O agente de IA poderá classificar relevância e explicar por que uma oportunidade é interessante, mas a data, URL, status e origem devem continuar vindo da fonte e passando por validação determinística.
