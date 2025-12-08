# 🎬 CineWeb - Sistema de Gerenciamento de Cinema

> Projeto desenvolvido para a disciplina de Laboratório de Desenvolvimento Web.

O **CineWeb** é uma aplicação completa para administração de cinemas e venda de ingressos. O sistema permite o gerenciamento de filmes, salas e sessões, além de simular um fluxo de venda de ingressos com mapa de assentos interativo e bomboniere.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as melhores práticas de desenvolvimento web moderno:

* **Frontend:** React + Vite
* **Linguagem:** TypeScript
* **Estilização:** Bootstrap 5 + Bootstrap Icons
* **Validação:** Zod (Schemas robustos)
* **Rotas:** React Router DOM
* **Backend:** Json-Server (v0.17.4)
* **Infraestrutura:** Docker & Docker Compose

---

## ✨ Funcionalidades

### 🎥 Filmes e Salas
* **CRUD Completo:** Cadastro, Edição, Listagem e Exclusão de Filmes e Salas.
* **Validação:** Regras para datas, classificação indicativa e capacidade das salas.

### 📅 Sessões (Agendamento)
* **Cruzamento de Dados:** Seleção de Filme e Sala integrados.
* **Regras de Negócio:** Validação de janela de exibição (filme precisa estar em cartaz) e datas retroativas.
* **Visualização:** Listagem com dados expandidos (Nome do Filme e Número da Sala).

### 🍿 Bomboniere
* **Catálogo:** Gerenciamento de Combos e Lanches.
* **Venda:** Integração dos lanches no carrinho de compras.

### 🎟️ Venda de Ingressos
* **Mapa Interativo:** Visualização gráfica dos assentos baseada na capacidade da sala.
* **Controle de Lotação:** Assentos vendidos ficam bloqueados automaticamente.
* **Carrinho:** Cálculo automático de Inteira/Meia e soma dos lanches.
* **Pedido:** Geração de registro completo vinculando Ingresso + Assento + Lanches.

---

## 📦 Como Rodar o Projeto

A maneira recomendada é utilizando **Docker** para garantir o ambiente correto.

### Pré-requisitos
* Docker e Docker Compose instalados.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/motinhapro/CinemaWeb]
    cd cineweb
    ```

2.  **Suba os containers:**
    ```bash
    docker-compose up --build
    ```

3.  **Acesse a aplicação:**
    * **Frontend:** http://localhost:5173
    * **Backend:** http://localhost:3000

---

## 🔧 Estrutura do Projeto

O código segue padrões de arquitetura limpa:

* **data/**: Contém o `db.json` (Banco de dados).
* **src/components/**: Componentes globais (ex: Navbar).
* **src/models/**: Schemas de validação Zod.
* **src/pages/**: Telas da aplicação (Filmes, Salas, Vendas, etc.).
* **src/services/**: Configuração da API (Axios).
* **src/types/**: Interfaces TypeScript globais.
* **docker-compose.yml**: Orquestração dos containers.

---

## 🧪 Notas Técnicas

1.  **Docker no Windows:** Utilizamos volumes mapeados para evitar erros de permissão (`EBUSY`) no Json-Server.
2.  **Json-Server:** Versão fixa em `0.17.4` para garantir funcionamento correto dos relacionamentos (`_expand`).
3.  **Assentos Dinâmicos:** O mapa da sala é renderizado matematicamente com base na capacidade cadastrada.

---