import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>

      <h2>Weekly Checklist</h2>

      <nav>

        <Link to="/">Início</Link>

        <Link to="/history">Histórico</Link>

        <Link to="/about">Sobre</Link>

        <button>Logout</button>

      </nav>

    </header>
  );
}