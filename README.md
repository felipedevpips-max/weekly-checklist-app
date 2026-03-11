# 📋 WeekTask — Checklist Semanal

**WeekTask** é uma aplicação fullstack de gerenciamento semanal de tarefas. Organize suas metas, acompanhe o progresso e mantenha o histórico de todas as semanas — com notificações automáticas para te manter no ritmo.

🔗 **Demo:** [weekly-checklist-app.vercel.app](https://weekly-checklist-app.vercel.app)  
💻 **Repositório:** [github.com/felipedevpips-max/weekly-checklist-app](https://github.com/felipedevpips-max/weekly-checklist-app)

---

## ✨ Funcionalidades

- **Autenticação completa** — cadastro e login com JWT + bcrypt
- **Gestão de tarefas** — criar, editar, deletar e filtrar por status (`pending`, `in_progress`, `done`)
- **Progresso visual** — barra de progresso e contagem regressiva da semana
- **Fechamento automático de semana** — todo sábado às 23:59 (BRT), a semana é encerrada automaticamente via cron job
- **Carry-over de tarefas** — tarefas `in_progress` são migradas automaticamente para a nova semana
- **Histórico** — visualize semanas anteriores agrupadas por mês
- **Notificações por e-mail** — lembrete na sexta-feira e resumo ao fechar a semana
- **Tema claro/escuro** — alternância entre temas com persistência
- **Background animado** — efeito visual com Three.js + Vanta.js
- **Server warmup** — tela de espera enquanto o backend inicia (Render free tier)
- **Self-ping** — o backend faz ping a cada 10 minutos para evitar cold start

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Uso |
|---|---|
| React 19 + TypeScript | Interface e tipagem |
| Vite | Bundler e dev server |
| React Router DOM v7 | Roteamento client-side (SPA) |
| Axios | Requisições HTTP |
| Framer Motion | Animações |
| Three.js + Vanta.js | Background animado |
| CSS Modules | Estilização escopada |

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js + Express 5 | API REST |
| PostgreSQL + pg | Banco de dados relacional |
| JWT + bcryptjs | Autenticação segura |
| node-cron | Agendamento de tarefas |
| Nodemailer / Resend / Brevo | Envio de e-mails |
| dotenv | Variáveis de ambiente |

### Infraestrutura
| Serviço | Uso |
|---|---|
| Vercel | Deploy do frontend |
| Render | Deploy do backend (free tier) |

---

## 🏗️ Estrutura do Projeto

```
weekly-checklist-app/
├── frontend/               # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Home, History, About, Login, Register
│   │   ├── hooks/          # Hooks customizados
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── services/       # Camada de API (Axios)
│   │   └── types/          # Tipagens TypeScript
│   └── vercel.json         # Rewrite para SPA routing
│
└── backend/                # Node.js + Express
    └── src/
        ├── controllers/    # authController, taskController, weekController...
        ├── services/       # authService, taskService, weekScheduler, notificationService...
        ├── repositories/   # taskRepository
        ├── routes/         # authRoutes, taskRoutes, weekRoutes...
        ├── middlewares/    # authMiddleware (JWT)
        └── config/         # Configuração do banco
```

---

## 🚀 Rodando localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
npm install
```

Crie um `.env` na pasta `backend/`:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/weektask
JWT_SECRET=sua_chave_secreta
BACKEND_URL=http://localhost:3000
ALLOWED_ORIGIN=http://localhost:5173

# Opcional — notificações por e-mail
BREVO_API_KEY=
BREVO_FROM_EMAIL=
BREVO_FROM_NAME=WeekTask
```

```bash
npm run dev
# Servidor rodando em http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
```

Crie um `.env` na pasta `frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
# App rodando em http://localhost:5173
```

---

## 🔄 Lógica de semanas

- Cada usuário tem uma **semana ativa** (domingo a sábado)
- Todo **sábado às 23:59 BRT** um cron job fecha a semana automaticamente
- Tarefas com status `in_progress` são **migradas** para a nova semana como `pending`
- Toda **sexta às 09:00 BRT** o usuário recebe um lembrete por e-mail com as tarefas pendentes
- Ao iniciar o servidor, um **catch-up** fecha semanas que expiraram durante o downtime

---

## 📡 Rotas da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro de usuário |
| POST | `/auth/login` | Login e geração de JWT |

### Tarefas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/tasks` | Listar tarefas da semana atual |
| POST | `/tasks` | Criar tarefa |
| PUT | `/tasks/:id` | Atualizar tarefa |
| DELETE | `/tasks/:id` | Deletar tarefa (soft delete) |

### Semanas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/weeks/current` | Semana atual do usuário |
| GET | `/weeks/history` | Histórico de semanas |
| POST | `/weeks/close` | Fechar semana manualmente |

### Outros
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check (self-ping) |
| GET | `/techs` | Lista de tecnologias usadas |

---

## ⚠️ Deploy no Vercel (SPA Routing)

Por ser uma SPA com React Router, é necessário o arquivo `frontend/vercel.json` para que rotas como `/history` e `/about` funcionem ao recarregar a página:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Sem esse arquivo, o Vercel retorna **404** em qualquer rota que não seja a raiz.

---


