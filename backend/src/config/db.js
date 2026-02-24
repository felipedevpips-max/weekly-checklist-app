const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "weekly",
  password: "4513",
  port: 5432,
});

module.exports = pool;
