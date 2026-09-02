import type { CSSProperties } from "react";
import { useRankings } from "../../context/RankingsContext";
import { CATEGORIES } from "./categories";
import styles from "./CategoryPicker.module.css";

const ACCENT_CYCLE = [
  "var(--tier-s)",
  "var(--tier-a)",
  "var(--tier-b)",
  "var(--tier-c)",
  "var(--tier-d)",
  "var(--tier-e)",
  "var(--tier-f)",
];

export function CategoryPicker() {
  const { createRanking, navigate } = useRankings();

  function pick(categoryId: (typeof CATEGORIES)[number]["id"]) {
    const rankingId = createRanking(categoryId);
    navigate({ view: "item-builder", rankingId });
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.heading}>What are we ranking today?</h1>
      <p className={styles.sub}>Pick a category to start building your list.</p>
      <div className={styles.grid}>
        {CATEGORIES.map((category, index) => (
          <button
            key={category.id}
            className={styles.tile}
            style={
              { "--tile-accent": ACCENT_CYCLE[index % ACCENT_CYCLE.length] } as CSSProperties
            }
            onClick={() => pick(category.id)}
          >
            <span className={styles.icon}>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
