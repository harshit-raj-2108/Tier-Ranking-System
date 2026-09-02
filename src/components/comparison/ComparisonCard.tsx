import type { RankingItem } from "../../types";
import styles from "./ComparisonCard.module.css";

interface ComparisonCardProps {
  item: RankingItem;
  onPick: () => void;
}

export function ComparisonCard({ item, onPick }: ComparisonCardProps) {
  return (
    <button className={styles.card} onClick={onPick}>
      {item.imageUrl ? (
        <img className={styles.image} src={item.imageUrl} alt="" />
      ) : (
        <div className={styles.imagePlaceholder} aria-hidden="true">
          {item.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <span className={styles.name}>{item.name}</span>
      {item.note && <span className={styles.note}>{item.note}</span>}
    </button>
  );
}
