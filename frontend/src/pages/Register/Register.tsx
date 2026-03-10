import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/useTheme";
import Dark from "../../assets/dark.png";
import Light from "../../assets/light.png";
import styles from "./register.module.css";
import { Container } from "../../components/Container/Container";
import { Footer } from "../../components/Footer/Footer";

export function Register() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;
  const strengthLabel = ["", "Fraca", "Boa", "Forte"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password, phone || undefined);
      navigate("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Erro ao criar conta. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.page}>
        {/* Left panel */}
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
              <span className={styles.logoText}>WeekTask</span>
            </div>

            <div className={styles.panelContent}>
              <h2 className={styles.panelHeading}>
                Comece agora,
                <br />
                de graça.
              </h2>
              <p className={styles.panelDesc}>
                Crie sua conta e comece a organizar suas semanas em segundos.
              </p>
              <div className={styles.steps}>
                {[
                  "Crie sua conta",
                  "Adicione suas tarefas",
                  "Acompanhe seu progresso",
                ].map((s, i) => (
                  <div key={i} className={styles.step}>
                    <span className={styles.stepNum}>{i + 1}</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
          </div>
        </div>

        {/* Right form */}
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
                <h1 className={styles.title}>Criar conta</h1>
                <p className={styles.subtitle}>
                  Preencha os dados abaixo para começar
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="name" className={styles.label}>
                      Nome
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
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>
                </div>

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
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.input}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Mostrar senha"
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
                  {password.length > 0 && (
                    <div className={styles.strengthBar}>
                      <div className={styles.strengthSegments}>
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className={styles.segment}
                            style={{
                              background:
                                passwordStrength >= n
                                  ? strengthColor[passwordStrength]
                                  : undefined,
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className={styles.strengthLabel}
                        style={{ color: strengthColor[passwordStrength] }}
                      >
                        {strengthLabel[passwordStrength]}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="phone" className={styles.label}>
                    WhatsApp <span className={styles.optional}>opcional</span>
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
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.11-1.11a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+55 11 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <span className={styles.hint}>
                    Para receber notificações via WhatsApp
                  </span>
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
                      <span className={styles.spinner} /> Criando conta...
                    </>
                  ) : (
                    "Criar conta grátis"
                  )}
                </button>
              </form>

              <p className={styles.link}>
                Já tem conta?{" "}
                <Link to="/login" className={styles.linkAnchor}>
                  Entrar →
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
