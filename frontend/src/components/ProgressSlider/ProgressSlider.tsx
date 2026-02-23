import React from "react";
import styles from "./ProgressSlider.module.css";

type Props = {
  progress: number;
  onChange: (value: number) => void;
  loading?: boolean;
};

export function ProgressSlider({ progress, onChange, loading = false }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={styles.progressContainer}>
      <input
        type="range"
        min={0}
        max={100}
        value={progress}
        onChange={handleChange}
        disabled={loading}
        className={styles.slider}
        style={{
          background: `linear-gradient(to right, #2ecc71 0%, #2ecc71 ${progress}%, #ddd ${progress}%, #ddd 100%)`,
        }}
      />
      <span className={styles.progressLabel}>{progress}%</span>
    </div>
  );
}