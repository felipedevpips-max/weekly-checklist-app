import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import styles from "./baseModal.module.css";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BaseModal({ isOpen, onClose, children }: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC para fechar
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Bloquear scroll do body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Clicar fora para fechar
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} ref={modalRef}>
        {children}
      </div>
    </div>
  );
}
