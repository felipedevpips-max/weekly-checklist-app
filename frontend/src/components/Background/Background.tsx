import { useEffect, useRef } from "react";
import { useTheme } from "../../context/useTheme";

interface VantaEffect {
  destroy: () => void;
}

export function Background() {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const effectRef = useRef<VantaEffect | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!vantaRef.current || !window.VANTA) return;

    if (theme === "light") {
      effectRef.current?.destroy();
      effectRef.current = null;
      return;
    }

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

  if (theme === "light") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        }}
      />
    );
  }

  return (
    <div
      ref={vantaRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
      }}
    />
  );
}