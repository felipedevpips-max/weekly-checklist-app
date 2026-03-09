import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./login.module.css";
import { Container } from "../../components/Container/Container";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Erro ao fazer login. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Container>
        <div className={styles.page}>
          <div className={styles.card}>
            <h1 className={styles.title}>Entrar</h1>
            <p className={styles.subtitle}>Acesse seu checklist semanal</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.button}
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className={styles.link}>
              Não tem conta? <Link to="/register">Criar conta</Link>
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
