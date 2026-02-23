import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./ProgressSliderWithCat.module.css";

type Props = {
  progress: number;
  onChange: (value: number) => void;
  loading?: boolean;
};

// Emoji do gato como handle
const catHandle = (props: any) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <div {...restProps} className={styles.handleWrapper}>
      <span className={styles.cat}>🐱</span>
    </div>
  );
};

export function ProgressSliderWithCat({ progress, onChange, loading = false }: Props) {
  return (
    <div className={styles.sliderWrapper}>
      <Slider
        min={0}
        max={100}
        value={progress}
        onChange={onChange}
        disabled={loading}
        trackStyle={{ backgroundColor: "#00ffff", height: 8 }}
        railStyle={{ backgroundColor: "#1f2038", height: 8 }}
        handle={catHandle}
      />
      <span className={styles.progressLabel}>{progress}%</span>
    </div>
  );
}