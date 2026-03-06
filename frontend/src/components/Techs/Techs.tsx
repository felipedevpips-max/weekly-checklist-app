import styles from "./techs.module.css";
import { useTechsInfo } from "../../hooks/useTechsInfo";

export function Techs() {
  const { techs, loading } = useTechsInfo();

  if (loading) {
    return <p className={styles.loading}>Carregando tecnologias...</p>;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Tecnologias utilizadas</h2>

      <div className={styles.grid}>
        {techs.map((tech) => (
          <div key={tech.id} className={styles.card}>
            <img
              src={`/techs/${tech.icon}`}
              alt={tech.name}
              className={styles.icon}
            />

            <h3 className={styles.name}>{tech.name}</h3>

            <p className={styles.description}>{tech.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}