import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";
import Logo from "../../assets/logo.svg?react";
import Logout from "../../assets/logout.svg?react";
import { useTheme } from "../../context/useTheme";
import Dark from "../../assets/dark.png";
import Light from "../../assets/light.png";
import { MenuHamburguer } from "../MenuHamburguer/Menuhamburguer";

export function Header() {
  const { theme, toggleTheme } = useTheme();
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
        <div className={styles.buttonContainer}>
          <button onClick={toggleTheme}>
            {theme === "dark" ? (
              <img src={Light} alt="Light mode" className={styles.lightIcon} />
            ) : (
              <img src={Dark} alt="Dark mode" className={styles.darkIcon} />
            )}
          </button>
          <NavLink to="/logout" className={styles.logoutButton}>
            <Logout className={styles.logoutIcon} />
          </NavLink>
          <MenuHamburguer />
        </div>
      </div>
    </header>
  );
}
