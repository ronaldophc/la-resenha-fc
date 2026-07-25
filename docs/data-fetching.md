# Regra de busca de dados (data fetching)

> **Regra de ouro:** busque no servidor **exatamente o subconjunto** que a tela precisa,
> usando **query params** para qualquer filtro/seleção. **Nunca** puxe uma coleção ampla
> e reduza para o subconjunto exibido no cliente.

Toda requisição é AJAX e escopada pelo que o usuário está vendo/selecionando.

## O que NÃO fazer ❌

- Buscar `GET /matches` (todas as partidas) e filtrar por campeonato/time/status no `.vue`.
- Buscar `GET /standings` (todas as tabelas) e filtrar por campeonato no cliente.
- Carregar tudo no `onMounted` e trocar o que aparece só mexendo em `computed`/`filter`.

## O que fazer ✅

- Um controle de UI (dropdown, aba, busca) mudou o dado exibido? Dispare **uma nova
  requisição** escopada pelo valor desse controle (via `watch`), com o filtro na query.
- Ao abrir a página: busque só o **necessário para o estado inicial** (ex.: a lista de
  opções do dropdown + os dados da opção padrão) — não o dataset inteiro.
- O cliente só pode **ordenar/formatar** dados que já vieram escopados. Não pode
  **excluir registros** que o servidor poderia ter filtrado.

## Exemplo de referência: página de Campeonatos (`resultados.vue`)

Fluxo correto (implementado):

1. `onMounted` → `GET /championships` só para montar o seletor e escolher o padrão.
2. Ao selecionar um campeonato (ou "Amistosos") ou trocar o status (Todos/Últimos/Próximos),
   um `watch` dispara:
   - `GET /matches?ownClub=true&championshipId=<id>&status=<status>`
   - `GET /standings?championshipId=<id>`
3. Nada de baixar todas as partidas/tabelas e filtrar no `.vue`.

## Suporte no backend

Endpoints de listagem aceitam filtros por query e filtram no Prisma:

- `GET /matches` — `championshipId`, `friendly=true`, `ownClub=true`, `status=upcoming|completed`
- `GET /standings` — `championshipId`
- `GET /teams` — `filter` (busca por nome)

Ao criar um novo endpoint de listagem que uma tela vá filtrar, **adicione o filtro na query
do backend** em vez de resolver no front. Mantenha esta regra para qualquer recurso novo.
