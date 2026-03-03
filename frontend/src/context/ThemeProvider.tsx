import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";

type Props = {
  children: ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Evita erro em SSR (caso use no futuro)
    if (typeof window === "undefined") return "light";

    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // Detecta preferência do sistema
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    return prefersDark ? "dark" : "light";
  });
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
