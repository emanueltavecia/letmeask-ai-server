# Let me ask - Server

Projeto desenvolvido durante o evento **NLW Agents** da Rocketseat.

## 🚀 Tecnologias Utilizadas

### Core

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Fastify** - Framework web rápido e eficiente

### Banco de Dados

- **PostgreSQL** - Banco de dados relacional
- **Drizzle ORM** - ORM type-safe para TypeScript
- **Docker** - Containerização do banco de dados

### Validação e Tipagem

- **Zod** - Validação de schemas TypeScript-first
- **fastify-type-provider-zod** - Integração entre Fastify e Zod

### Qualidade de Código

- **Biome** - Linter e formatter
- **Husky** - Git hooks

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose

## 🔧 Setup e Configuração

### 1. Clone o repositório

```bash
git clone git@github.com:emanueltavecia/letmeask-ai-server.git
cd letmeask-ai-server
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/letmeask
```

### 4. Inicie o banco de dados

```bash
docker compose up -d
```

### 5. Execute as migrações

```bash
npx drizzle-kit migrate
```

### 6. (Opcional) Execute o seed do banco

```bash
npm run db:seed
```

### 7. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3333`

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo de desenvolvimento
- `npm start` - Inicia o servidor em modo de produção
- `npm run db:seed` - Executa o seed do banco de dados

## 🏗️ Estrutura do Projeto

```
src/
├── db/
│   ├── connection.ts      # Configuração da conexão com o banco
│   ├── seed.ts           # Scripts de seed
│   ├── migrations/       # Migrações do banco de dados
│   └── schema/           # Schemas do Drizzle ORM
├── http/
│   └── routes/           # Rotas da API
├── env.ts                # Configuração de variáveis de ambiente
└── server.ts             # Configuração do servidor Fastify
```

## 🔗 Endpoints

- `GET /health` - Health check da aplicação
- `GET /rooms` - Lista as salas disponíveis

## 🐳 Docker

O projeto inclui um `docker-compose.yml` configurado com PostgreSQL utilizando a extensão pgvector.

Para parar o banco de dados:

```bash
docker compose down
```
