import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { RankingItem } from "../../types";
import styles from "./TierItemCard.module.css";

interface TierItemCardProps {
  item: RankingItem;
}

export function TierItemCard({ item }: TierItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.card}
      {...attributes}
      {...listeners}
      title={item.name}
    >
      {item.imageUrl ? (
        <img className={styles.image} src={item.imageUrl} alt="" draggable={false} />
      ) : (
        <div className={styles.imagePlaceholder}>{item.name.slice(0, 1).toUpperCase()}</div>
      )}
      <span className={styles.name}>{item.name}</span>
    </div>
  );
}
