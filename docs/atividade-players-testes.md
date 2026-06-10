# Relatório de Testes - Módulo de Jogadores (Players)

Este documento contém o roteiro de testes e as descrições das requisições para a API de Jogadores (`/players`), prontas para a inclusão das capturas de tela (prints) das respostas no Insomnia/Postman.

---

## 1. Criação de Jogador (POST /players)

### Cenário A: Criação com Dados Válidos (Sucesso)
* **Teste:** Criando um Jogador (POST `/players`)
* **Objetivo:** Testar a criação de um novo jogador no sistema com dados válidos.
* **Resultado:** Sucesso, código `201 Created`. Retorna o objeto do jogador criado com seu respectivo ID gerado pelo banco de dados.
* **Print da Requisição:**
  *(Insira aqui o print do caso de sucesso no Insomnia/Postman)*

### Cenário B: Tentativa de Criação com Número Duplicado (Falha)
* **Teste:** Tentativa de Criação com Número Duplicado (POST `/players`)
* **Objetivo:** Garantir a restrição de unicidade no número da camisa do jogador.
* **Resultado:** Falha, código `409 Conflict`. A API aciona a exceção customizada `PlayerNumberAlreadyInUseException`, e o filtro de exceção global retorna o erro padronizado informando que o número digitado já está em uso por outro jogador.
* **Print da Requisição:**
  *(Insira aqui o print da resposta de erro no Insomnia/Postman)*

---

## 2. Listagem Geral de Jogadores (GET /players)

### Cenário A: Listagem Sem Filtro
* **Teste:** Listagem Geral de Jogadores (GET `/players`)
* **Objetivo:** Testar a recuperação de todos os jogadores cadastrados no sistema.
* **Resultado:** Sucesso, código `200 OK`. Retorna uma lista (array) contendo todos os jogadores e seus respectivos atributos cadastrados.
* **Print da Requisição:**
  *(Insira aqui o print da listagem no Insomnia/Postman)*

### Cenário B: Listagem Filtrada por Nome ou Posição
* **Teste:** Listagem Filtrada (GET `/players?filter=carlos`)
* **Objetivo:** Testar o mecanismo de busca e filtro por partes do nome ou da posição dos jogadores.
* **Resultado:** Sucesso, código `200 OK`. Retorna apenas os jogadores que atendam ao critério especificado no parâmetro de busca.
* **Print da Requisição:**
  *(Insira aqui o print do filtro no Insomnia/Postman)*

---

## 3. Busca de Jogador por ID (GET /players/:id)

### Cenário A: Busca por ID Existente (Sucesso)
* **Teste:** Busca por ID (GET `/players/:id`)
* **Objetivo:** Testar a recuperação detalhada de um jogador específico a partir do seu ID.
* **Resultado:** Sucesso, código `200 OK`. Retorna o objeto completo do jogador correspondente ao ID informado.
* **Print da Requisição:**
  *(Insira aqui o print da busca por ID com sucesso)*

### Cenário B: Busca por ID Inexistente (Falha)
* **Teste:** Busca por ID Inexistente (GET `/players/:id`)
* **Objetivo:** Verificar a resposta da API ao buscar por um identificador que não existe no banco de dados.
* **Resultado:** Falha, código `404 Not Found`. A API lança uma `NotFoundException` com uma mensagem clara informando que o jogador não foi encontrado.
* **Print da Requisição:**
  *(Insira aqui o print da resposta 404 no Insomnia/Postman)*

---

## 4. Atualização de Jogador (PUT/PATCH /players/:id)

### Cenário A: Atualização Parcial de Dados (Sucesso)
* **Teste:** Atualização Parcial (PATCH `/players/:id`)
* **Objetivo:** Testar a atualização de campos específicos de um jogador já cadastrado.
* **Resultado:** Sucesso, código `200 OK`. Retorna o objeto do jogador com as alterações aplicadas e a data de atualização (`updatedAt`) atualizada.
* **Print da Requisição:**
  *(Insira aqui o print da atualização no Insomnia/Postman)*

### Cenário B: Atualização para um Número Duplicado (Falha)
* **Teste:** Atualização com Conflito de Número (PATCH `/players/:id`)
* **Objetivo:** Testar se o sistema bloqueia a alteração do número de camisa de um jogador para um número que já pertença a outro jogador cadastrado.
* **Resultado:** Falha, código `409 Conflict`. Retorna erro de conflito disparado pela regra de negócio, impedindo a alteração.
* **Print da Requisição:**
  *(Insira aqui o print da falha por número duplicado no Insomnia/Postman)*

---

## 5. Remoção de Jogador (DELETE /players/:id)

### Cenário A: Remoção de Jogador Existente (Sucesso)
* **Teste:** Remoção de Jogador (DELETE `/players/:id`)
* **Objetivo:** Testar a exclusão física de um jogador do banco de dados a partir do seu ID.
* **Resultado:** Sucesso, código `204 No Content`. O recurso é excluído permanentemente e nenhuma resposta de corpo é enviada.
* **Print da Requisição:**
  *(Insira aqui o print da exclusão realizada com sucesso)*

### Cenário B: Remoção de Jogador Inexistente (Falha)
* **Teste:** Remoção de ID Inexistente (DELETE `/players/:id`)
* **Objetivo:** Garantir que a API trate corretamente tentativas de exclusão de jogadores não cadastrados.
* **Resultado:** Falha, código `404 Not Found`. Retorna erro informando que o recurso alvo não existe para ser excluído.
* **Print da Requisição:**
  *(Insira aqui o print da resposta 404 na tentativa de exclusão)*
