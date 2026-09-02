import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useMemo } from "react";
import { useRankings } from "../../context/RankingsContext";
import { TIER_ORDER, type TierKey } from "../../types";
import { Button } from "../shared/Button";
import { TierRow } from "./TierRow";
import { TIER_PRESETS } from "./tierPresets";
import styles from "./TierBoard.module.css";

interface TierBoardProps {
  rankingId: string;
}

function findTierOfItem(
  tiers: Record<TierKey, string[]>,
  itemId: string,
): TierKey | undefined {
  return TIER_ORDER.find((tier) => tiers[tier].includes(itemId));
}

function isTierKey(value: string): value is TierKey {
  return (TIER_ORDER as readonly string[]).includes(value);
}

export function TierBoard({ rankingId }: TierBoardProps) {
  const { getRanking, moveTierItem, navigate } = useRankings();
  const ranking = getRanking(rankingId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const itemsById = useMemo(
    () => new Map(ranking?.items.map((item) => [item.id, item]) ?? []),
    [ranking?.items],
  );

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromTier = findTierOfItem(ranking!.tiers, activeId);
    if (!fromTier) return;

    let toTier: TierKey;
    let toIndex: number;

    if (isTierKey(overId)) {
      toTier = overId;
      toIndex = ranking!.tiers[toTier].length;
    } else {
      toTier = findTierOfItem(ranking!.tiers, overId) ?? fromTier;
      toIndex = ranking!.tiers[toTier].indexOf(overId);
    }

    moveTierItem(rankingId, activeId, toTier, toIndex);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1>{ranking.name}</h1>
        <Button variant="secondary" onClick={() => navigate({ view: "rankings-library" })}>
          Back to Rankings
        </Button>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          {TIER_ORDER.map((tier) => (
            <TierRow
              key={tier}
              tier={tier}
              preset={ranking.tierOverrides?.[tier]
                ? { ...TIER_PRESETS[tier], ...ranking.tierOverrides[tier] }
                : TIER_PRESETS[tier]}
              itemIds={ranking.tiers[tier]}
              itemsById={itemsById}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
