import styles from "./container.module.css";
import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}
