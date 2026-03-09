import styles from "./skeletonLoader.module.css";

interface SkeletonLoaderProps {
  count?: number;
  variant?: "card" | "line" | "header";
}

export function SkeletonLoader({
  count = 3,
  variant = "card",
}: SkeletonLoaderProps) {
  return (
    <div className={styles.wrapper}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${styles.skeleton} ${styles[variant]}`} />
      ))}
    </div>
  );
}
