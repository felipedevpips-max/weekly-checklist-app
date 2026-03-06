import { Container } from "../../components/Container/Container";
import { useTechsInfo } from "../../hooks/useTechsInfo";
import styles from "./about.module.css";

export function About() {
  const { techs, loading } = useTechsInfo();

  return (
    <Container>
      <div className={styles.container}>
        <h1 className={styles.title}>Sobre o Projeto</h1>

        <p className={styles.description}>
          Weekify é um sistema simples de gerenciamento semanal de tarefas
          feito para ajudar a organizar metas e acompanhar progresso.
        </p>

        {/* ================= FUNCIONALIDADES ================= */}

        <h2 className={styles.subtitle}>Funcionalidades</h2>

        <ul className={styles.list}>
          <li>Criar tarefas</li>
          <li>Editar tarefas</li>
          <li>Deletar tarefas</li>
          <li>Acompanhar progresso semanal</li>
          <li>Visualizar histórico de semanas</li>
        </ul>

        {/* ================= TECNOLOGIAS ================= */}

        <h2 className={styles.subtitle}>Tecnologias</h2>

        {loading ? (
          <p className={styles.loading}>Carregando tecnologias...</p>
        ) : (
          <div className={styles.techGrid}>
            {techs.map((tech) => (
              <div key={tech.id} className={styles.techCard}>
                <img
                  src={`/techs/${tech.icon}`}
                  alt={tech.name}
                  className={styles.techIcon}
                />

                <h3>{tech.name}</h3>

                <p>{tech.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* ================= OBJETIVO ================= */}

        <h2 className={styles.subtitle}>Objetivo</h2>

        <p className={styles.description}>
          O objetivo deste projeto é praticar arquitetura fullstack,
          organização de estado no frontend e regras de negócio no backend,
          simulando um sistema real de produtividade semanal.
        </p>
      </div>
    </Container>
  );
}