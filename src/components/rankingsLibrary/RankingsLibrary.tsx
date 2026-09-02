import { useState } from "react";
import { useRankings } from "../../context/RankingsContext";
import type { ComparisonStatus } from "../../types";
import { Button } from "../shared/Button";
import { ConfirmModal } from "../shared/Modal";
import { RankingCard } from "./RankingCard";
import styles from "./RankingsLibrary.module.css";

const VIEW_FOR_STATUS: Record<ComparisonStatus, "item-builder" | "comparison" | "tier-board"> = {
  not_started: "item-builder",
  in_progress: "comparison",
  complete: "tier-board",
};

export function RankingsLibrary() {
  const { rankings, renameRanking, deleteRanking, navigate } = useRankings();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pendingDelete = rankings.find((r) => r.id === pendingDeleteId);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1>Rankings</h1>
        <Button onClick={() => navigate({ view: "landing" })}>New Ranking</Button>
      </div>

      {rankings.length === 0 ? (
        <p className={styles.empty}>
          No rankings yet. Start a new one to build your first tier list.
        </p>
      ) : (
        <div className={styles.grid}>
          {rankings.map((ranking) => (
            <RankingCard
              key={ranking.id}
              ranking={ranking}
              onOpen={() =>
                navigate({
                  view: VIEW_FOR_STATUS[ranking.comparison.status],
                  rankingId: ranking.id,
                })
              }
              onRename={(name) => renameRanking(ranking.id, name)}
              onDelete={() => setPendingDeleteId(ranking.id)}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete ranking?"
          message={`"${pendingDelete.name}" will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={() => {
            deleteRanking(pendingDelete.id);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}
