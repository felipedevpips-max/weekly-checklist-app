import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import Logo from "../../assets/logo.svg?react";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>

        <Logo className={styles.logo} />

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