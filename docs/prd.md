# 📄 Product Requirements Document (PRD) - La Resenha FC

**Projeto:** La Resenha FC — Sistema Full-Cycle de Gestão e Divulgação de Time de Várzea  
**Versão:** 1.0.0  
**Status:** 🟢 Definido (MVP)  
**Autores:** Ronaldo P H Campos

---

## 🎯 1. Visão Geral e Objetivo

Times de futebol de várzea operam com gestão completamente dispersa: resultados são anúncios em grupos de WhatsApp, escalações são rabiscadas em papel e a única "vitrine" digital do time costuma ser um perfil no Instagram — sem histórico organizado, sem tabela de classificação e sem uma identidade online própria.

O **La Resenha FC** resolve isso com um sistema full-cycle que centraliza toda a informação do time em um único lugar, dando ao clube uma presença digital profissional sem depender de redes sociais de terceiros.

O sistema é composto por duas frentes:
- **Página Pública:** vitrine para torcedores acompanharem notícias, resultados, tabela de classificação e elenco — sem necessidade de login.
- **Painel Administrativo:** área restrita para gestores cadastrarem e gerenciarem todas as informações do time.

---

## 📖 2. Glossário Ubíquo

| Termo | Definição |
|---|---|
| **Gestor** | Administrador do time com acesso ao painel restrito (ex: presidente, secretário). |
| **Torcedor** | Visitante da página pública, sem necessidade de login. |
| **Elenco** | Conjunto de jogadores ativos cadastrados com seus dados. |
| **Partida** | Registro de um jogo com data, adversário, local e resultado. |
| **Notícia** | Conteúdo textual publicado pelo gestor para os torcedores. |
| **Tabela** | Classificação do time em um campeonato específico. |
| **JWT** | Token de autenticação emitido após login bem-sucedido do gestor. |
| **Várzea** | Modalidade de futebol amador disputado em campos comunitários. |

---

## 👤 3. Personas e Permissões

### 🧑‍🤝‍🧑 Torcedor (Usuário Público)
- Acessa a página pública sem autenticação.
- Consome informações: elenco, resultados, notícias, tabela de classificação.
- Hoje depende exclusivamente do Instagram do time para se informar — sem histórico organizado e sujeito ao algoritmo da plataforma.
- **Não possui** nenhuma permissão de escrita no sistema.

### 🧑‍💼 Gestor (Administrador)
- Presidente, secretário ou responsável pela comunicação do time.
- Hoje gerencia tudo via WhatsApp e Instagram Stories — sem centralização e sem histórico.
- Realiza login com e-mail e senha no painel administrativo.
- Possui acesso total ao CRUD de todas as entidades do sistema.
- Recebe um JWT após autenticação que autoriza todas as operações protegidas.

---

## 📝 4. Escopo Funcional, Histórias de Usuário e Critérios de Aceitação (MoSCoW)

### 🔴 US01 - Documentação Técnica do Projeto (Must Have)
**Ator:** Gestor do Projeto | **História:** Como gestor do projeto, quero ter o PRD e o SDD (com diagrama de banco de dados em Mermaid) versionados na pasta `/docs` do repositório, para que a equipe e os avaliadores tenham uma referência técnica única, rastreável e sempre updated.

**✅ Critérios de Aceitação:**
- [X] O arquivo `docs/prd.md` contém as personas, User Stories e critérios de aceitação do sistema.
- [X] O arquivo `docs/sdd.md` contém o diagrama de entidades do banco de dados em sintaxe Mermaid, os contratos dos principais endpoints da API (método, rota, request/response) e o fluxo de autenticação JWT.
- [X] Ambos os documentos são gerados e refinados com o auxílio de IA (Claude), com evidência no histórico de commits.

> **Requisitos técnicos cobertos:** `ID1`

---

### 🔴 US02 - Estrutura de Monorepo no GitHub (Must Have)
**Ator:** Desenvolvedor | **História:** Como desenvolvedor, quero que o projeto seja organizado como um Monorepo no GitHub, com os diretórios `backend/` (NestJS) e `frontend/` (Nuxt) no mesmo repositório, para que eu gerencie o ciclo de vida completo da aplicação em um único lugar.

**✅ Critérios de Aceitação:**
- [X] O repositório no GitHub contém, na raiz, a estrutura de monorepo (diretórios `apps/api` e `apps/web`).
- [X] Cada diretório possui seu próprio `package.json` com scripts independentes (`start`, `test`, `build`).
- [X] O `README.md` raiz descreve a estrutura do monorepo e como executar cada parte localmente.

> **Requisitos técnicos cobertos:** `ID2`

---

### 🔴 US03 - Backlog Rastreável no GitHub Projects (Must Have)
**Ator:** Gestor do Projeto | **História:** Como gestor do projeto, quero que cada User Story deste PRD seja registrada como uma Issue no GitHub e organizada no GitHub Projects (quadro Kanban), para que eu tenha visibilidade do progresso do desenvolvimento a qualquer momento.

**✅ Critérios de Aceitação:**
- [X] Cada US deste PRD possui uma Issue correspondente no repositório, com título, descrição e critérios de aceitação.
- [X] As Issues estão vinculadas ao GitHub Projects em colunas: `Backlog`, `In Progress`, `In Review`, `Done`.
- [X] As Issues são fechadas automaticamente via `Closes #XX` nos Pull Requests que as implementam.

> **Requisitos técnicos cobertos:** `ID3`

---

### 🔴 US04 - Fluxo de Desenvolvimento com GitFlow (Must Have)
**Ator:** Desenvolvedor | **História:** Como desenvolvedor, quero utilizar o GitFlow com branches de feature isoladas e Pull Requests revisados para integrar código na branch principal, para que a branch `develop` seja sempre estável e todo código passe por revisão antes do merge.

**✅ Critérios de Aceitação:**
- [X] O repositório possui branches protegidas: `main` (produção) e `develop` (integração).
- [X] Cada funcionalidade é desenvolvida em uma branch `feature/nome-da-feature` criada a partir de `develop`.
- [X] A integração em `develop` ocorre exclusivamente por Pull Request; merges diretos são bloqueados.
- [X] Cada PR referencia a Issue correspondente e tem seu histórico de commits limpo e descritivo.

> **Requisitos técnicos cobertos:** `ID4`

---

### 🔴 US05 - Login do Gestor com JWT (Must Have)
**Ator:** Gestor | **História:** Como gestor, quero fazer login no painel administrativo com meu e-mail e senha para receber um token JWT, para que eu possa acessar de forma segura todas as rotas protegidas da API.

**✅ Critérios de Aceitação:**
- [X] A rota `POST /auth/login` aceita `{ email, password }` e retorna um JWT assinado com expiração configurável.
- [X] Credenciais inválidas retornam `401 Unauthorized` com mensagem padronizada via `HttpExceptionFilter`.
- [X] O JWT contém o `userId` e o `role` do gestor no payload (claim).
- [X] Todas as rotas administrativas são protegidas por um `JwtAuthGuard`; sem token válido, retornam `401`.
- [X] O `RoleGuard` garante que somente usuários com papel `ADMIN` acessem as rotas de gestão.
- [X] O DTO de login é validado com `class-validator`; entradas malformadas retornam `400 Bad Request`.
- [ ] O segredo JWT (`JWT_SECRET`) é lido do ambiente via `ConfigModule` e nunca está hardcoded no código.

> **Requisitos técnicos cobertos:** `ID5`, `ID6`, `ID8`, `ID15`

---

### 🔴 US06 - Gestão do Elenco (Must Have)
**Ator:** Gestor | **História:** Como gestor, quero cadastrar, editar, visualizar e remover jogadores do elenco pelo painel administrativo, para que a lista de atletas esteja sempre atualizada e reflita o time real — substituindo as listas de WhatsApp que se perdem com o tempo.

**✅ Critérios de Aceitação:**
- [X] **[C]** `POST /players` — aceita `{ name, number, position, photoUrl? }`. Retorna `201 Created` com o objeto criado.
- [X] **[R]** `GET /players` — retorna lista de todos os jogadores ordenada por número (acesso público).
- [X] **[R]** `GET /players/:id` — retorna um jogador específico (acesso público).
- [X] **[U]** `PATCH /players/:id` — atualiza parcialmente os dados do jogador (requer JWT Admin).
- [X] **[D]** `DELETE /players/:id` — remove o jogador; retorna `204 No Content` (requer JWT Admin).
- [X] Todas as operações de escrita utilizam DTOs com `class-validator` e `ValidationPipe` com `whitelist: true`.
- [X] O `PlayersController` delega toda a lógica ao `PlayersService`; controllers não acessam o Prisma diretamente.
- [X] O `PlayersService` utiliza Prisma ORM para todas as operações com o banco de dados.
- [X] Respostas de sucesso são formatadas uniformemente pelo `TransformInterceptor` global.
- [X] Tentativa de buscar jogador inexistente lança `NotFoundException`, capturada pelo `HttpExceptionFilter`.

> **Requisitos técnicos cobertos:** `ID5`, `ID6`, `ID7`, `ID8`, `ID9`

---

### 🔴 US07 - Gestão de Partidas e Resultados (Must Have)
**Ator:** Gestor | **História:** Como gestor, quero registrar, editar e remover partidas com data, adversário, local e placar, para que o histórico de resultados do time seja completo e organizado — substituindo as postagens efêmeras do Instagram Stories.

**✅ Critérios de Aceitação:**
- [ ] **[C]** `POST /matches` — aceita `{ date, opponent, location, homeScore, awayScore, championship? }`. Retorna `201 Created`.
- [ ] **[R]** `GET /matches` — retorna lista de partidas ordenadas por data decrescente (acesso público).
- [ ] **[R]** `GET /matches/:id` — retorna detalhes de uma partida (acesso público).
- [ ] **[U]** `PATCH /matches/:id` — atualiza dados da partida (requer JWT Admin).
- [ ] **[D]** `DELETE /matches/:id` — remove a partida (requer JWT Admin).
- [ ] O campo `date` é validado como `IsDateString()`; placares como `IsInt()` e `Min(0)` no DTO.
- [ ] O `MatchesService` encapsula toda a lógica de negócio; o `MatchesController` é apenas um roteador.
- [ ] O `MatchesService` utiliza Prisma ORM para todas as operações com o banco de dados.

> **Requisitos técnicos cobertos:** `ID5`, `ID6`, `ID7`, `ID8`, `ID9`

---

### 🔴 US08 - Gestão de Notícias (Must Have)
**Ator:** Gestor | **História:** Como gestor, quero publicar, editar e remover notícias e comunicados pelo painel administrativo, para que os torcedores sejam informados sobre as novidades do time em um canal próprio — sem depender do alcance orgânico do Instagram.

**✅ Critérios de Aceitação:**
- [X] **[C]** `POST /news` — aceita `{ title, content, imageUrl?, publishedAt? }`. Retorna `201 Created`.
- [X] **[R]** `GET /news` — retorna lista de notícias ordenadas pela data mais recente (acesso público).
- [X] **[R]** `GET /news/:id` — retorna o conteúdo completo de uma notícia (acesso público).
- [X] **[U]** `PATCH /news/:id` — atualiza a notícia (requer JWT Admin).
- [X] **[D]** `DELETE /news/:id` — remove a notícia (requer JWT Admin).
- [X] O `title` é validado como `IsString()` e `MaxLength(200)`; `content` como `IsString()` e `MinLength(10)`.
- [X] O `NewsService` utiliza Prisma ORM para todas as operações com o banco de dados.

> **Requisitos técnicos cobertos:** `ID5`, `ID6`, `ID7`, `ID8`, `ID9`

---

### 🟡 US09 - Gestão da Tabela de Classificação (Should Have)
**Ator:** Gestor | **História:** Como gestor, quero atualizar os dados de classificação do campeonato (pontos, vitórias, saldo de gols), para que os torcedores acompanhem a posição do La Resenha FC sem precisar procurar em grupos de WhatsApp.

**✅ Critérios de Aceitação:**
- [ ] **[C]** `POST /standings` — aceita `{ championship, position, points, played, won, drawn, lost, goalsFor, goalsAgainst }`. Retorna `201 Created`.
- [ ] **[R]** `GET /standings` — retorna a tabela ordenada por `position` (acesso público).
- [ ] **[U]** `PUT /standings/:id` — atualiza o registro completo (requer JWT Admin).
- [ ] **[D]** `DELETE /standings/:id` — remove o registro (requer JWT Admin).
- [ ] Todos os campos numéricos são validados com `IsInt()` e `Min(0)` nos DTOs.
- [ ] O `StandingsService` utiliza Prisma ORM para todas as operações com o banco de dados.

> **Requisitos técnicos cobertos:** `ID5`, `ID6`, `ID7`, `ID8`, `ID9`

---

### 🔴 US10 - Respostas Padronizadas e Tratamento Global de Erros (Must Have)
**Ator:** Desenvolvedor | **História:** Como desenvolvedor, quero que todas as respostas de sucesso sigam um envelope padrão via `TransformInterceptor` e que todos os erros sejam capturados por um `HttpExceptionFilter` global, para que o frontend tenha um contrato de API consistente e previsível.

**✅ Critérios de Aceitação:**
- [X] O `TransformInterceptor` (implementa `NestInterceptor`) envolve toda resposta de sucesso no formato `{ data: T, statusCode: number, message: string }`.
- [X] O `HttpExceptionFilter` (implementa `ExceptionFilter`) captura todas as exceções HTTP e retorna `{ statusCode, message, timestamp, path }`.
- [X] Ambos são registrados globalmente no `main.ts` com `app.useGlobalInterceptors` e `app.useGlobalFilters`.
- [X] Exceções inesperadas retornam `500 Internal Server Error` sem vazar detalhes internos para o cliente.

> **Requisitos técnicos cobertos:** `ID9`

---

### 🔴 US11 - Testes Automatizados com TDD (Must Have)
**Ator:** Desenvolvedor | **História:** Como desenvolvedor, quero escrever testes Jest para cada service antes de implementar a lógica de negócio (TDD), para que o comportamento esperado do sistema seja validado automaticamente e regressões sejam detectadas imediatamente.

**✅ Critérios de Aceitação:**
- [ ] Para cada `XxxService`, existe um arquivo `xxx.service.spec.ts` com testes criados **antes** da implementação final (evidenciado pelo histórico de commits).
- [ ] Os testes cobrem os cenários de **sucesso** (happy path) e de **erro** (ex: entidade não encontrada, dados inválidos) de cada operation de CRUD.
- [ ] O comando `npm run test` executa toda a suite e todos os testes passam com `0 failures`.
- [ ] A cobertura de código dos services está acima de 70% (`npm run test:cov`).
- [ ] Os testes utilizam dependências mockadas via `jest.fn()` (Prisma e outros serviços), garantindo isolamento total das unidades.

> **Requisitos técnicos cobertos:** `ID10`, `ID11`

---

### 🔴 US12 - Documentação Interativa da API com Swagger (Must Have)
**Ator:** Desenvolvedor | **História:** Como desenvolvedor, quero que a API NestJS exponha uma documentação Swagger interativa e sempre atualizada, para que o frontend, testadores e avaliadores possam explorar e testar os endpoints sem consultar fontes externas.

**✅ Critérios de Aceitação:**
- [X] O Swagger UI está disponível na rota `/api` da aplicação backend.
- [X] Todos os endpoints estão documentados com `@ApiTags`, `@ApiOperation`, `@ApiResponse` e `@ApiBearerAuth` onde aplicável.
- [X] Os DTOs de request e response estão decorados com `@ApiProperty`, gerando schemas automáticos no Swagger.
- [X] O endpoint de login está documentado com exemplos de request body e os possíveis códigos de resposta (`200`, `401`).

> **Requisitos técnicos cobertos:** `ID12`

---

### 🔴 US13 - Torcedor Visualiza o Elenco (Must Have)
**Ator:** Torcedor | **História:** Como torcedor, quero visualizar a lista completa de jogadores do elenco na página pública, com foto, número e posição, para que eu conheça os atletas do La Resenha FC sem precisar procurar em postagens antigas do Instagram.

**✅ Critérios de Aceitação:**
- [ ] A rota `/elenco` do frontend exibe cards dos jogadores consumidos do endpoint `GET /players`.
- [ ] A página é renderizada com Server-Side Rendering (SSR) via Nuxt para favorecer o SEO.
- [ ] Em caso de falha na API, exibe uma mensagem amigável de indisponibilidade sem quebrar a página.

> **Requisitos técnicos cobertos:** `ID13`, `ID14`

---

### 🔴 US14 - Torcedor Visualiza Resultados das Partidas (Must Have)
**Ator:** Torcedor | **História:** Como torcedor, quero visualizar a lista de partidas com placar, adversário e data, para que eu acompanhe o desempenho do time ao longo do campeonato — com um histórico que o Instagram jamais manteria organizado.

**✅ Critérios de Aceitação:**
- [ ] A rota `/resultados` exibe as partidas consumidas de `GET /matches`, ordenadas da mais recente para a mais antiga.
- [ ] Vitórias, empates e derrotas são diferenciadas visualmente com cores distintas.
- [ ] O componente de listagem é reutilizável e desacoplado da lógica de fetch.

> **Requisitos técnicos cobertos:** `ID13`, `ID14`

---

### 🔴 US15 - Torcedor Visualiza Notícias (Must Have)
**Ator:** Torcedor | **História:** Como torcedor, quero ler as notícias publicadas pelo gestor na página pública, para que eu me mantenha informado sobre o La Resenha FC em um canal que não desaparece após 24 horas como um Story.

**✅ Critérios de Aceitação:**
- [ ] A rota `/noticias` exibe lista de notícias consumidas de `GET /news`.
- [ ] A rota `/noticias/:id` exibe o conteúdo completo consumido de `GET /news/:id`.
- [ ] O título da aba do navegador muda dinamicamente com o título da notícia (meta tag `title`).

> **Requisitos técnicos cobertos:** `ID13`, `ID14`

---

### 🟡 US16 - Torcedor Visualiza a Tabela de Classificação (Should Have)
**Ator:** Torcedor | **História:** Como torcedor, quero visualizar a tabela de classificação do campeonato, para que eu saiba a posição do La Resenha FC entre os times do torneio sem precisar perguntar em grupos de WhatsApp.

**✅ Critérios de Aceitação:**
- [ ] A rota `/tabela` exibe a classificação consumida de `GET /standings`, com colunas: Pos, Time, Pts, J, V, E, D, SG.
- [ ] O La Resenha FC é destacado visualmente na tabela.

> **Requisitos técnicos cobertos:** `ID13`, `ID14`

---

### 🔴 US17 - Login do Gestor pelo Painel Administrativo (Must Have)
**Ator:** Gestor | **História:** Como gestor, quero fazer login pelo painel administrativo no frontend, receber meu JWT e tê-lo persistido de forma segura, para que eu acesse as telas de gestão sem precisar autenticar a cada requisição.

**✅ Critérios de Aceitação:**
- [ ] A rota `/admin/login` exibe formulário de e-mail e senha que consome `POST /auth/login`.
- [ ] O JWT recebido é armazenado em um cookie `httpOnly` ou no estado gerenciado pelo Pinia.
- [ ] Todas as requisições às rotas protegidas da API incluem o header `Authorization: Bearer <token>`.
- [ ] Ao tentar acessar qualquer rota `/admin/*` sem JWT válido, o usuário é redirecionado para `/admin/login` via middleware de rota Nuxt.
- [ ] O logout limpa o token e redireciona para `/admin/login`.

> **Requisitos técnicos cobertos:** `ID8`, `ID13`, `ID14`

---

### 🔴 US18 - Gerenciamento Seguro de Variáveis de Ambiente (Must Have)
**Ator:** Desenvolvedor | **História:** Como desenvolvedor, quero que todas as credenciais sensíveis sejam lidas exclusivamente de variáveis de ambiente via `ConfigModule` e nunca estejam hardcoded no código-fonte ou expostas no repositório, para que a aplicação seja segura em qualquer ambiente.

**✅ Critérios de Aceitação:**
- [ ] O arquivo `.env` está no `.gitignore` e **nunca** é commitado no repositório.
- [ ] O repositório contém um `.env.example` com as chaves necessárias e sem valores reais.
- [ ] O `ConfigModule` é importado com `isGlobal: true` no `AppModule`; variáveis são acessadas via `ConfigService`.
- [ ] As variáveis obrigatórias incluem: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`.
- [ ] A aplicação falha explicitamente na inicialização se variáveis obrigatórias estiverem ausentes.

> **Requisitos técnicos cobertos:** `ID15`

---

### 🔴 US19 - Pipeline de CI com GitHub Actions (Must Have)
**Ator:** Desenvolvedor | **História:** Como desenvolvedor, quero um pipeline de CI configurado no GitHub Actions que execute os testes Jest e o linting automaticamente a cada Pull Request direcionado a `develop`, para que nenhum código quebrado seja integrado à branch principal.

**✅ Critérios de Aceitação:**
- [ ] O arquivo `.github/workflows/ci.yml` executa em todo `push` e `pull_request` nas branches `develop` e `main`.
- [ ] O pipeline executa em sequência: `npm ci` → `npm run lint` → `npm run test`.
- [ ] O merge do PR é bloqueado pelo GitHub se o pipeline retornar status de falha.
- [ ] Variáveis de ambiente de teste são configuradas como Secrets no repositório do GitHub.

> **Requisitos técnicos cobertos:** `ID16`

---

### 🔴 US20 - Deploy em Produção na Nuvem (Must Have)
**Ator:** Gestor | **História:** Como gestor, quero que o sistema esteja disponível em um domínio público conectado a um banco de dados PostgreSQL em produção (Neon.tech), para que torcedores e gestores possam acessar o La Resenha FC de qualquer lugar, a qualquer hora — sem depender de uma rede social de terceiro.

**✅ Critérios de Aceitação:**
- [ ] O backend NestJS está implantado e acessível publicamente (ex: Railway, Render ou Fly.io).
- [ ] O frontend Nuxt está implantado e acessível publicamente (ex: Vercel ou Netlify).
- [ ] O banco de dados PostgreSQL em produção é gerenciado pelo Neon.tech.
- [ ] A variável `DATABASE_URL` do Neon.tech é injetada como variável de ambiente na plataforma de deploy, sem nenhuma referência em código.
- [ ] O link de produção está documentado no `README.md` do repositório.
- [ ] As migrações Prisma (`prisma migrate deploy`) fazem parte do processo de deploy.

> **Requisitos técnicos cobertos:** `ID17`

---

## 🗺️ 5. Matriz de Rastreabilidade: User Stories × Requisitos Técnicos

| ID | Descrição Resumida | User Stories |
|:---:|---|---|
| ID1 | PRD e SDD com Mermaid | US01 |
| ID2 | Monorepo no GitHub | US02 |
| ID3 | Backlog no GitHub Projects | US03 |
| ID4 | GitFlow com PRs | US04 |
| ID5 | Separação de camadas NestJS | US05, US06, US07, US08, US09 |
| ID6 | DTOs e ValidationPipes | US05, US06, US07, US08, US09 |
| ID7 | CRUD com Prisma ORM | US06, US07, US08, US09 |
| ID8 | JWT e controle de acesso | US05, US06, US07, US08, US09, US17 |
| ID9 | Interceptors e Exception Filters | US06, US07, US08, US09, US10 |
| ID10 | TDD com Jest | US11 |
| ID11 | Testes passando | US11 |
| ID12 | Swagger/OpenAPI | US12 |
| ID13 | Interfaces visuais (Nuxt) | US13, US14, US15, US16, US17 |
| ID14 | Frontend consome API com JWT | US13, US14, US15, US16, US17 |
| ID15 | Credenciais seguras via ConfigModule | US05, US18 |
| ID16 | CI com GitHub Actions | US19 |
| ID17 | Deploy em produção | US20 |

## ⚙️ 6. Requisitos Não Funcionais

- **Desempenho:** A página pública deve carregar em menos de 3 segundos em conexão 4G (Lighthouse Score > 80).
- **Segurança:** A API não deve expor dados internos em mensagens de erro; JWTs expiram em no máximo 8 horas.
- **Responsiveness:** Todas as telas do frontend devem funcionar corretamente em dispositivos móveis (320px+), pois a maioria dos torcedores acessa via celular.
- **Manutenibilidade:** Cobertura mínima de 70% nos testes dos services para garantir refatorações seguras.
- **Disponibilidade:** O sistema deve ter uptime de 99% nos períodos de jogos (fins de semana).
