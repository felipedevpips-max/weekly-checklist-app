require("dotenv").config();

const { pool } = require("./database/connection");

const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");
const weekRoutes = require("./routes/weekRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const techsRoutes = require("./routes/techsRoutes");
const authRoutes = require("./routes/authRoutes");
const { startScheduler } = require("./services/weekScheduler");

pool
  .connect()
  .then(() => {
    console.log("Banco conectado com sucesso!");
    startScheduler();
    startSelfPing();
  })
  .catch((err) => console.error("Erro ao conectar:", err));

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.endsWith(".vercel.app") ||
        origin === process.env.ALLOWED_ORIGIN
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// ── Health check (usado pelo self-ping e por monitoramentos externos) ──
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ROTAS
app.use("/tasks", taskRoutes);
app.use("/weeks", weekRoutes);
app.use("/notifications", notificationRoutes);
app.use("/techs", techsRoutes);
app.use("/auth", authRoutes);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));

// ── Self-ping: evita cold start no Render (plano free dorme após 15min) ──
function startSelfPing() {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.log("[SelfPing] BACKEND_URL não definida — self-ping desativado.");
    return;
  }

  const INTERVAL_MS = 10 * 60 * 1000; // 10 minutos

  setInterval(async () => {
    try {
      const res = await fetch(`${backendUrl}/health`);
      console.log(`[SelfPing] ✅ Ping OK — ${new Date().toLocaleTimeString("pt-BR")}`);
    } catch (err) {
      console.warn(`[SelfPing] ⚠️ Ping falhou:`, err.message);
    }
  }, INTERVAL_MS);

  console.log(`[SelfPing] ✅ Self-ping ativado a cada 10min → ${backendUrl}/health`);
}
