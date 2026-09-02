import { useState } from "react";
import { useRankings } from "../../context/RankingsContext";
import { Button } from "../shared/Button";
import { ItemForm, type ItemFormValues } from "./ItemForm";
import { ItemRow } from "./ItemRow";
import styles from "./ItemListBuilder.module.css";

interface ItemListBuilderProps {
  rankingId: string;
}

export function ItemListBuilder({ rankingId }: ItemListBuilderProps) {
  const { getRanking, addItem, updateItem, removeItem, renameRanking, startComparison, navigate } =
    useRankings();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const ranking = getRanking(rankingId);

  if (!ranking) {
    return (
      <div className={styles.wrap}>
        <p>This ranking no longer exists.</p>
        <Button onClick={() => navigate({ view: "rankings-library" })}>
          Back to Rankings
        </Button>
      </div>
    );
  }

  const canStart = ranking.items.length >= 2;
  const alreadyStarted = ranking.comparison.status !== "not_started";

  function handleStart() {
    if (alreadyStarted) {
      navigate({
        view: ranking!.comparison.status === "complete" ? "tier-board" : "comparison",
        rankingId,
      });
      return;
    }
    startComparison(rankingId);
    navigate({ view: "comparison", rankingId });
  }

  return (
    <div className={styles.wrap}>
      <input
        className={styles.nameInput}
        value={ranking.name}
        onChange={(e) => renameRanking(rankingId, e.target.value)}
      />

      <h2 className={styles.sectionTitle}>Add items to rank</h2>
      <ItemForm submitLabel="Add" onSubmit={(values) => addItem(rankingId, values)} />

      <ul className={styles.list}>
        {ranking.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            isEditing={editingItemId === item.id}
            onStartEdit={() => setEditingItemId(item.id)}
            onCancelEdit={() => setEditingItemId(null)}
            onSave={(values: ItemFormValues) => {
              updateItem(rankingId, item.id, values);
              setEditingItemId(null);
            }}
            onRemove={() => removeItem(rankingId, item.id)}
          />
        ))}
      </ul>

      {ranking.items.length === 0 && (
        <p className={styles.empty}>No items yet - add at least two to start comparing.</p>
      )}

      <div className={styles.footer}>
        <span className={styles.count}>{ranking.items.length} item(s)</span>
        <Button disabled={!canStart} onClick={handleStart}>
          {alreadyStarted
            ? ranking.comparison.status === "complete"
              ? "View Tier List"
              : "Continue Comparing"
            : "Start Comparing"}
        </Button>
      </div>
    </div>
  );
}
