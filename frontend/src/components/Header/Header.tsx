import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";
import Logo from "../../assets/logo.svg?react";
import Logout from "../../assets/logout.svg?react";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div>
          <Logo className={styles.logo} />
        </div>

        <div className={styles.navContainer}>
          <nav className={styles.nav}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? `${styles.active}` : undefined
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                isActive ? `${styles.active}` : undefined
              }
            >
              Histórico
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? `${styles.active}` : undefined
              }
            >
              Sobre
            </NavLink>
          </nav>
        </div>
        <div className={styles.logoutContainer}>
          <NavLink to="/logout">
            <Logout className={styles.logoutIcon} />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
