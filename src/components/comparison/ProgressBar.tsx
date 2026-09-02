import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  made: number;
  estimate: number;
}

export function ProgressBar({ made, estimate }: ProgressBarProps) {
  const pct = estimate > 0 ? Math.min(100, Math.round((made / estimate) * 100)) : 100;

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.label}>
        matchup <strong className={styles.count}>{made}</strong> of ~{estimate}
      </span>
    </div>
  );
}
