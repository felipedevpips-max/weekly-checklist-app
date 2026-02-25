import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h2 className={styles.title}>Weekify</h2>

        <nav className={styles.nav}>
          <Link to="/">Início</Link>

          <Link to="/history">Histórico</Link>

          <Link to="/about">Sobre</Link>

          <button>Logout</button>
        </nav>
      </div>
    </header>
  );
}
