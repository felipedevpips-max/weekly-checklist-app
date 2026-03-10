# WeekTask

**Sistema de gerenciamento semanal de tarefas** — organize sua semana, acompanhe seu progresso e receba notificações automáticas por email e WhatsApp.

🔗 **Demo:** [weekly-checklist-app.vercel.app](https://weekly-checklist-app.vercel.app)

---

## Sobre o projeto

O WeekTask é uma aplicação fullstack que permite criar, organizar e acompanhar tarefas semanais. A semana é encerrada automaticamente todo sábado às 23:59, as tarefas não concluídas são movidas para a nova semana, e o usuário recebe um resumo por email.

---

## Funcionalidades

- **Autenticação completa** — cadastro, login e sessão com JWT
- **Gerenciamento de tarefas** — criar, editar, deletar, filtrar por status e prioridade
- **Progresso visual** — barra de progresso da semana em tempo real
- **Contador regressivo** — exibe quanto tempo falta para a semana encerrar
- **Encerramento automático** — cron job fecha a semana todo sábado às 23:59 (BRT)
- **Histórico de semanas** — visualize semanas anteriores e suas tarefas
- **Sistema de notificações** por email e WhatsApp (Twilio):
  - Boas-vindas ao se cadastrar
  - Confirmação ao criar tarefa com notificação ativa
  - Confirmação ao ativar notificação em tarefa existente
  - Lembrete de véspera toda sexta às 09:00
  - Resumo de tarefas pendentes no encerramento da semana
- **Tema claro/escuro**
- **Design responsivo**

---

## Stack

**Frontend**
- React 18
- TypeScript
- Vite
- CSS Modules

**Backend**
- Node.js
- Express
- PostgreSQL
- JWT (autenticação)
- Nodemailer (email)
- Twilio (WhatsApp)
- node-cron (agendamento)

**Deploy**
- Frontend: Vercel
- Backend: Render
- Banco de dados: Render PostgreSQL

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```dotenv
DATABASE_URL=postgresql://postgres:senha@localhost:5432/weekly
JWT_SECRET=sua_chave_secreta
APP_URL=http://localhost:5173
ALLOWED_ORIGIN=http://localhost:5173

# Email (opcional para testes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@gmail.com
SMTP_PASS=sua_senha_de_app
SMTP_FROM="WeekTask <seu@gmail.com>"

# WhatsApp via Twilio (opcional)
# TWILIO_ACCOUNT_SID=ACxxx
# TWILIO_AUTH_TOKEN=xxx
# TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Crie o banco e as tabelas:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50)
);

CREATE TABLE weeks (
  id SERIAL PRIMARY KEY,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  closed BOOLEAN DEFAULT false,
  user_id INTEGER REFERENCES users(id)
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'low',
  notify BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  week_id INTEGER REFERENCES weeks(id),
  user_id INTEGER REFERENCES users(id),
  archived BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);
```

Inicie o servidor:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Inicie o frontend:

```bash
npm run dev
```

Acesse `http://localhost:5173`

---

## Estrutura do projeto

```
weekly-checklist-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── taskService.js
│   │   │   ├── weekService.js
│   │   │   ├── notificationService.js
│   │   │   └── weekScheduler.js
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── app.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/
    │   └── types/
    └── package.json
```

---

## API — principais endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Cadastro |
| POST | /auth/login | Login |
| GET | /weeks/current | Semana atual com tarefas |
| POST | /tasks | Criar tarefa |
| PATCH | /tasks/:id | Atualizar tarefa |
| DELETE | /tasks/:id | Deletar tarefa |
| GET | /notifications/status | Status dos canais de notificação |
| POST | /notifications/send | Enviar lembrete manual |

---

## Deploy

**Backend (Render)**
- Build Command: `npm install`
- Start Command: `npm start`
- Variáveis de ambiente: configurar no painel do Render

**Frontend (Vercel)**
- Framework: Vite
- Variável de ambiente: `VITE_API_URL=https://seu-backend.onrender.com`

---

## Autor

Desenvolvido por **Felipe Costa**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Felipe_Costa-blue)](https://linkedin.com/in/felipecosta)
