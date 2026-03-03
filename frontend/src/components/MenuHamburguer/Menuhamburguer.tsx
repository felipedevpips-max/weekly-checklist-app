import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./MenuHamburguer.module.css";
import Logout from "../../assets/logout.svg?react";
import About from "../../assets/menu/about.svg?react";
import History from "../../assets/menu/history.svg?react";
import Home from "../../assets/menu/home.svg?react";

export const MenuHamburguer = () => {
  const [open, setOpen] = useState(false);

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
        <nav>
          <NavLink to="/" onClick={handleClose} className={styles.homeMobile}>
            <Home />
            Início
          </NavLink>

          <NavLink
            to="/history"
            onClick={handleClose}
            className={styles.historyMobile}
          >
            <History />
            Histórico
          </NavLink>

          <NavLink
            to="/about"
            onClick={handleClose}
            className={styles.aboutMobile}
          >
            <About />
            Sobre
          </NavLink>
          <NavLink
            to="/logout"
            onClick={handleClose}
            className={styles.logoutMobile}
          >
            <Logout />
            Logout
          </NavLink>
        </nav>
      </aside>
    </>
  );
};
