const { pool } = require("./database/connection");

const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");

pool
  .connect()
  .then(() => console.log("Banco conectado com sucesso!"))
  .catch((err) => console.error("Erro ao conectar:", err));

const app = express();

app.use(cors());
app.use(express.json());

app.use("/tasks", taskRoutes);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
