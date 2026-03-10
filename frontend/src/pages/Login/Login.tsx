import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/useTheme";
import Dark from "../../assets/dark.png";
import Light from "../../assets/light.png";
import styles from "./login.module.css";
import { Container } from "../../components/Container/Container";

export function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className={styles.page}>
      {/* Left panel - branding */}
      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <div className={styles.logo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect
                width="36"
                height="36"
                rx="10"
                fill="rgba(255,255,255,0.15)"
              />
              <path
                d="M10 13h16M10 18h10M10 23h13"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="26" cy="23" r="4" fill="white" fillOpacity="0.9" />
              <path
                d="M24 23l1.5 1.5 2.5-2.5"
                stroke="#034ba3"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.logoText}>WeekCheck</span>
          </div>

          <div className={styles.panelContent}>
            <h2 className={styles.panelHeading}>
              Organize sua semana,
              <br />
              conquiste seus objetivos.
            </h2>
            <p className={styles.panelDesc}>
              Acompanhe tarefas, prioridades e progresso semanal num só lugar.
            </p>
            <div className={styles.features}>
              {[
                "Tarefas organizadas por semana",
                "Prioridades e status em tempo real",
                "Histórico completo de progresso",
              ].map((f, i) => (
                <div key={i} className={styles.feature}>
                  <span className={styles.featureIcon}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </div>

      {/* Right panel - form */}
      <Container>
        <div className={styles.formSide}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {theme === "dark" ? (
              <img
                src={Light}
                alt="Modo claro"
                className={styles.lightThemeIcon}
              />
            ) : (
              <img
                src={Dark}
                alt="Modo escuro"
                className={styles.darkThemeIcon}
              />
            )}
          </button>
          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Bem-vindo de volta</h1>
              <p className={styles.subtitle}>
                Entre na sua conta para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <svg
                    className={styles.inputIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                  Senha
                </label>
                <div className={styles.inputWrapper}>
                  <svg
                    className={styles.inputIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Mostrar/ocultar senha"
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.error}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={styles.button}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} /> Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            <p className={styles.link}>
              Não tem conta?{" "}
              <Link to="/register" className={styles.linkAnchor}>
                Criar conta grátis →
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
