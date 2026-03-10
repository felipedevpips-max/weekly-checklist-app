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

// ROTAS
app.use("/tasks", taskRoutes);
app.use("/weeks", weekRoutes);
app.use("/notifications", notificationRoutes);
app.use("/techs", techsRoutes);
app.use("/auth", authRoutes);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
