import { useState, type CSSProperties } from "react";
import { CATEGORIES } from "../landing/categories";
import type { RankingList } from "../../types";
import { Button } from "../shared/Button";
import styles from "./RankingCard.module.css";

interface RankingCardProps {
  ranking: RankingList;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

const STATUS_LABEL = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
} as const;

const STATUS_COLOR = {
  not_started: "var(--color-border)",
  in_progress: "var(--color-accent)",
  complete: "var(--tier-c)",
} as const;

export function RankingCard({ ranking, onOpen, onRename, onDelete }: RankingCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(ranking.name);
  const categoryLabel =
    CATEGORIES.find((c) => c.id === ranking.category)?.label ?? ranking.category;

  function saveRename() {
    const trimmed = draftName.trim();
    if (trimmed) onRename(trimmed);
    setIsRenaming(false);
  }

  return (
    <div
      className={styles.card}
      style={{ "--status-color": STATUS_COLOR[ranking.comparison.status] } as CSSProperties}
    >
      <div className={styles.body} onClick={!isRenaming ? onOpen : undefined}>
        {isRenaming ? (
          <input
            className={styles.renameInput}
            value={draftName}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveRename()}
          />
        ) : (
          <h3 className={styles.name}>{ranking.name}</h3>
        )}
        <p className={styles.meta}>
          {categoryLabel} · {ranking.items.length} item(s)
        </p>
        <span className={styles.badge} data-status={ranking.comparison.status}>
          {STATUS_LABEL[ranking.comparison.status]}
        </span>
      </div>
      <div className={styles.actions}>
        {isRenaming ? (
          <>
            <Button variant="secondary" onClick={saveRename}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setIsRenaming(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setIsRenaming(true)}>
              Rename
            </Button>
            <Button variant="ghost" onClick={onDelete}>
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
