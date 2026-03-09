const { pool } = require("../database/connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =============================
// 📝 REGISTRAR USUÁRIO
// =============================
async function registerUser(data) {
  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [data.email]
  );

  if (existing.rows.length > 0) {
    throw new Error("Email já cadastrado");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone`,
    [data.name, data.email, passwordHash, data.phone || null]
  );

  const user = result.rows[0];

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
}

// =============================
// 🔐 LOGIN
// =============================
async function loginUser(data) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [data.email]
  );

  if (result.rows.length === 0) {
    throw new Error("Email ou senha inválidos");
  }

  const dbUser = result.rows[0];

  const passwordMatch = await bcrypt.compare(
    data.password,
    dbUser.password_hash
  );

  if (!passwordMatch) {
    throw new Error("Email ou senha inválidos");
  }

  const token = jwt.sign(
    { id: dbUser.id, email: dbUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const user = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
  };

  return { user, token };
}

// =============================
// 👤 BUSCAR PERFIL
// =============================
async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, phone FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};