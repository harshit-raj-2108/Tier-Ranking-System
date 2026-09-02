import { useRankings } from "../../context/RankingsContext";
import { CATEGORIES } from "./categories";
import styles from "./CategoryPicker.module.css";

export function CategoryPicker() {
  const { createRanking, navigate } = useRankings();

  function pick(categoryId: (typeof CATEGORIES)[number]["id"]) {
    const rankingId = createRanking(categoryId);
    navigate({ view: "item-builder", rankingId });
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.heading}>What would you like to rank?</h1>
      <p className={styles.sub}>Pick a category to start building your list.</p>
      <div className={styles.grid}>
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={styles.tile}
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
