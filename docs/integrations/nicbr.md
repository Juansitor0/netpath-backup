# Integração NIC.br

## Fonte inicial

A primeira fonte externa é a agenda pública oficial:

- Agenda: <https://cursoseventos.nic.br/agenda>
- Semana de Capacitação: <https://semanacap.bcp.nic.br/>
- Notícias e releases: <https://nic.br/noticias/indice/>

A agenda apresenta cursos, turmas, eventos, modalidades, períodos de inscrição, datas e links. Esses dados entram no contrato genérico de `CatalogItem`.

## Decisão técnica

O NetPath começa pela agenda pública e por um adaptador isolado. Não tratamos endpoints internos do portal como API pública estável: eles podem mudar sem aviso e não devem ser a única base do produto.

O registro da fonte está em `data/catalog/sources.json` e o contrato do adaptador em `server/catalog/nicbr.ts`.

## Campos normalizados

- título e provedor;
- tipo: curso ou evento;
- modalidade;
- data de início e fim;
- janela de inscrição;
- carga horária, quando publicada;
- tópicos;
- URL oficial;
- status do item;
- data da última atualização.

## Política planejada

- sincronização diária no backend publicado;
- botão de sincronização manual;
- prévia de novos cursos e mudanças;
- preservação de edições editoriais;
- associação opcional com etapas e certificações da trilha.

A sincronização real e o agendamento entram depois que o backend e o banco forem habilitados.
