import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./MenuHamburguer.module.css";
import About from "../../assets/menu/about.svg?react";
import History from "../../assets/menu/history.svg?react";
import Home from "../../assets/menu/home.svg?react";
import { useAuth } from "../../hooks/useAuth";

export const MenuHamburguer = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const handleClose = () => setOpen(false);

  return (
    <>
      <div className={styles.hamburguer} onClick={() => setOpen(!open)}>
        <span className={open ? styles.active : ""}></span>
        <span className={open ? styles.active : ""}></span>
        <span className={open ? styles.active : ""}></span>
      </div>

      {open && <div className={styles.overlay} onClick={handleClose} />}

      <aside className={`${styles.mobileMenu} ${open ? styles.open : ""}`}>
        {user && (
          <div className={styles.menuHeader}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className={styles.userName}>Olá, {user.name.split(" ")[0]}</span>
            </div>
          </div>
        )}

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            onClick={handleClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ""}`
            }
          >
            <Home />
            Início
          </NavLink>

          <NavLink
            to="/history"
            onClick={handleClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ""}`
            }
          >
            <History />
            Histórico
          </NavLink>

          <NavLink
            to="/about"
            onClick={handleClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ""}`
            }
          >
            <About />
            Sobre
          </NavLink>
        </nav>
      </aside>
    </>
  );
};
