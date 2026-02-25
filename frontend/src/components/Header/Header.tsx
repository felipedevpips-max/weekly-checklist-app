import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import Logo from "../../assets/logo.svg?react";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div>
          <Logo className={styles.logo} />
        </div>

        <div className={styles.navContainer}>
          <nav className={styles.nav}>
            <Link to="/">Início</Link>
            <Link to="/history">Histórico</Link>
            <Link to="/about">Sobre</Link>
          </nav>
        </div>
        <div className={styles.logoutContainer}>
          <Link to="/logout">Logout</Link>
        </div>
      </div>
    </header>
  );
}
