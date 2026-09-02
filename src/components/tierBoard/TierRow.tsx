import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import type { RankingItem, TierKey } from "../../types";
import { TierItemCard } from "./TierItemCard";
import type { TierPreset } from "./tierPresets";
import styles from "./TierRow.module.css";

interface TierRowProps {
  tier: TierKey;
  preset: TierPreset;
  itemIds: string[];
  itemsById: Map<string, RankingItem>;
}

export function TierRow({ tier, preset, itemIds, itemsById }: TierRowProps) {
  const { setNodeRef } = useDroppable({ id: tier });
  const items = itemIds.map((id) => itemsById.get(id)).filter((i): i is RankingItem => Boolean(i));

  return (
    <div className={styles.row}>
      <div className={styles.chip} style={{ background: preset.color }}>
        <span className={styles.chipLetter}>{preset.label}</span>
        <span className={styles.chipDescription}>{preset.description}</span>
      </div>
      <div className={styles.dropZone} ref={setNodeRef}>
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          {items.map((item) => (
            <TierItemCard key={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
