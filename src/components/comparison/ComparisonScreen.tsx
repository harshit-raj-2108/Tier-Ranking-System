import { useEffect } from "react";
import { getNextComparison } from "../../algorithms/mergeSort";
import { useRankings } from "../../context/RankingsContext";
import { Button } from "../shared/Button";
import { ComparisonCard } from "./ComparisonCard";
import { ProgressBar } from "./ProgressBar";
import styles from "./ComparisonScreen.module.css";

interface ComparisonScreenProps {
  rankingId: string;
}

export function ComparisonScreen({ rankingId }: ComparisonScreenProps) {
  const { getRanking, recordComparison, undoComparison, navigate } = useRankings();
  const ranking = getRanking(rankingId);

  // The stored comparison state is always already fast-forwarded past any
  // auto-resolved steps (recordComparison does that before saving), so
  // this is a pure, side-effect-free read - true on first load too, which
  // is what makes resuming mid-sort work without a special code path.
  const { next } = ranking ? getNextComparison(ranking.comparison) : { next: null };

  useEffect(() => {
    if (ranking && next === null) {
      navigate({ view: "tier-board", rankingId });
    }
  }, [ranking, next, rankingId, navigate]);

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

  if (!next) {
    return null;
  }

  const itemA = ranking.items.find((item) => item.id === next.itemAId);
  const itemB = ranking.items.find((item) => item.id === next.itemBId);
  if (!itemA || !itemB) return null;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.heading}>Which do you like more?</h1>
      <ProgressBar
        made={ranking.comparison.comparisonsMade}
        estimate={ranking.comparison.totalComparisonsEstimate}
      />
      <div className={styles.arena}>
        <ComparisonCard item={itemA} onPick={() => recordComparison(rankingId, itemA.id)} />
        <span className={styles.vs}>VS</span>
        <ComparisonCard item={itemB} onPick={() => recordComparison(rankingId, itemB.id)} />
      </div>
      <Button
        variant="ghost"
        disabled={ranking.comparison.history.length === 0}
        onClick={() => undoComparison(rankingId)}
      >
        Undo last pick
      </Button>
    </div>
  );
}
