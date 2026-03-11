import { NavLink, useNavigate } from "react-router-dom";
import styles from "./header.module.css";
import Logo from "../../assets/logo.svg?react";
import Logout from "../../assets/logout.svg?react";
import { useTheme } from "../../context/useTheme";
import { useAuth } from "../../hooks/useAuth";
import Dark from "../../assets/dark.png";
import Light from "../../assets/light.png";
import { MenuHamburguer } from "../MenuHamburguer/Menuhamburguer";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div>
          <NavLink
            to="/"
            className={styles.logo}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Logo className={styles.logo} />
          </NavLink>
        </div>

        <div className={styles.navContainer}>
          <nav className={styles.nav}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              Início
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              Histórico
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              Sobre
            </NavLink>
          </nav>
        </div>

        <div className={styles.buttonContainer}>
          {user && (
            <span className={styles.userName}>
              Olá, {user.name.split(" ")[0]}
            </span>
          )}

          <button onClick={toggleTheme}>
            {theme === "dark" ? (
              <img src={Light} alt="Light mode" className={styles.lightIcon} />
            ) : (
              <img src={Dark} alt="Dark mode" className={styles.darkIcon} />
            )}
          </button>

          <button onClick={handleLogout} className={styles.logoutButton}>
            <Logout className={styles.logoutIcon} />
          </button>

          <MenuHamburguer />
        </div>
      </div>
    </header>
  );
}
