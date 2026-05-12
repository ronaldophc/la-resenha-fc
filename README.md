# 📍 La Resenha FC!

* 🔗 **Link em Produção:** [Aguardando Deploy na Nuvem]
* 🎨 **Design (Google Stitch):** [Acessar Projeto](https://stitch.withgoogle.com/projects/6193393013944718801)
* 👨‍💻 **Autores:** Ronaldo P H Campos

## 🎯 1. Visão Geral

Sistema Full-Cycle para gestão e divulgação de um time de futebol amador. O sistema conta com uma **página pública** para torcedores acompanharem notícias, resultados, tabelas e elenco, e um **painel administrativo** restrito para gestores cadastrarem e gerenciarem todas as informações do time.

## 📚 2. Documentação Oficial (Docs as Code)
Toda a especificação do sistema está versionada na pasta `/docs`:
* 📄 **[PRD (Product Requirements Document)](./docs/prd.md):** Visão do produto, Personas, User Stories e Divisão de Épicos.
* 📐 **[SDD (Software Design Document)](./docs/sdd.md):** Diagrama de banco de dados (Mermaid), contratos de API, DTOs e Fluxo de Autenticação.
* ✅ **[Checklist de Avaliação](./docs/checklist.md):** Controle de entrega dos IDs e RAs da disciplina de Tópicos Especiais.

## 🛠 3. Stack Tecnológica
* **Arquitetura:** Monorepo (Back, Front e Extensão no mesmo repositório).
* **Backend (API):** NestJS, TypeScript, JWT, Google OAuth.
* **Banco de Dados:** PostgreSQL (Nuvem) gerenciado via Prisma ORM.
* **Frontend (Mobile App):** Nuxt.
* **Integração:** Extensão de Navegador (Chrome) com manipulação de DOM.
