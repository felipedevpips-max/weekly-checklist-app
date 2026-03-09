const authService = require("../services/authService");

// =============================
// 📝 REGISTRO
// =============================
async function register(req, res) {
  console.log("BODY:", req.body);

  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nome, email e senha são obrigatórios" });
    }

    const result = await authService.registerUser({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    const message = error.message || "Erro ao registrar";
    const status = message === "Email já cadastrado" ? 409 : 500;
    res.status(status).json({ error: message });
  }
}

// =============================
// 🔐 LOGIN
// =============================
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const result = await authService.loginUser({ email, password });

    res.json(result);
  } catch (error) {
    const message = error.message || "Erro ao fazer login";
    const status = message === "Email ou senha inválidos" ? 401 : 500;

    res.status(status).json({ error: message });
  }
}

// =============================
// 👤 PERFIL
// =============================
async function getProfile(req, res) {
  try {
    const user = await authService.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
}

module.exports = {
  register,
  login,
  getProfile,
};
