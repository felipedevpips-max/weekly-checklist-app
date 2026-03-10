// frontend/src/components/WeekCountdown/WeekCountdown.tsx
import { useEffect, useState } from "react";
import styles from "./weekCountdown.module.css";

type Props = {
  endDate: string; // ISO string do end_date da semana
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function calcTimeLeft(endDate: string): TimeLeft {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function WeekCountdown({ endDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const isUrgent = !timeLeft.expired && timeLeft.days === 0 && timeLeft.hours < 12;

  if (timeLeft.expired) {
    return (
      <div className={`${styles.wrapper} ${styles.expired}`}>
        <span className={styles.expiredIcon}>🔒</span>
        <span className={styles.expiredText}>Semana encerrando...</span>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${isUrgent ? styles.urgent : ""}`}>
      <span className={styles.label}>
        {isUrgent ? "⚠️ Semana encerra em" : "⏳ Semana encerra em"}
      </span>
      <div className={styles.timer}>
        <div className={styles.unit}>
          <span className={styles.value}>{pad(timeLeft.days)}</span>
          <span className={styles.unitLabel}>dias</span>
        </div>
        <span className={styles.sep}>:</span>
        <div className={styles.unit}>
          <span className={styles.value}>{pad(timeLeft.hours)}</span>
          <span className={styles.unitLabel}>horas</span>
        </div>
        <span className={styles.sep}>:</span>
        <div className={styles.unit}>
          <span className={styles.value}>{pad(timeLeft.minutes)}</span>
          <span className={styles.unitLabel}>min</span>
        </div>
        <span className={styles.sep}>:</span>
        <div className={styles.unit}>
          <span className={styles.value}>{pad(timeLeft.seconds)}</span>
          <span className={styles.unitLabel}>seg</span>
        </div>
      </div>
    </div>
  );
}
