import styles from "./container.module.css";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useTheme } from "../../context/useTheme";

interface VantaEffect {
  destroy: () => void;
}

export function Container({ children }: { children: ReactNode }) {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const effectRef = useRef<VantaEffect | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!vantaRef.current || !window.VANTA) return;

    // Se for light, destrói qualquer efeito ativo
    if (theme === "light") {
      effectRef.current?.destroy();
      effectRef.current = null;
      return;
    }

    // Se for dark, cria o Vanta
    effectRef.current = window.VANTA.DOTS({
      el: vantaRef.current,
      backgroundColor: 0x0a0f1f,
      color: 0x1b2a52,
      color2: 0x16213e,
      size: 2,
      spacing: 40,
      showLines: false,
    });

    return () => {
      effectRef.current?.destroy();
    };
  }, [theme]);

  return (
    <>
      {/* ===== FUNDO DARK (VANTA) ===== */}
      {theme === "dark" && (
        <div
          ref={vantaRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
          }}
        />
      )}

      {/* ===== FUNDO LIGHT (GRADIENT CLEAN) ===== */}
      {theme === "light" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            background:
              "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
          }}
        />
      )}

      {/* ===== CONTEÚDO NORMAL ===== */}
      <div className={styles.container}>
        {children}
      </div>
    </>
  );
}