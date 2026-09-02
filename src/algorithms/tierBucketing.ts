import { TIER_ORDER, type TierAssignment } from "../types";

// Middle tiers get a larger share than the extremes, matching typical
// tier-list intuition (few S/F picks, more B/C/D). Sums to 1.
const TIER_WEIGHTS: Record<(typeof TIER_ORDER)[number], number> = {
  S: 0.08,
  A: 0.13,
  B: 0.17,
  C: 0.24,
  D: 0.17,
  E: 0.13,
  F: 0.08,
};

function emptyTiers(): TierAssignment {
  return TIER_ORDER.reduce((acc, tier) => {
    acc[tier] = [];
    return acc;
  }, {} as TierAssignment);
}

/**
 * Splits a fully-ranked order (best first) into the 7 fixed tiers by
 * proportional band, guaranteeing every tier key exists (possibly as
 * an empty array) so the drag-and-drop board never needs null checks.
 */
export function bucketIntoTiers(finalOrder: string[]): TierAssignment {
  const tiers = emptyTiers();
  const n = finalOrder.length;
  if (n === 0) return tiers;

  let cursor = 0;
  let remaining = n;
  const tierKeys = [...TIER_ORDER];

  tierKeys.forEach((tier, i) => {
    const isLast = i === tierKeys.length - 1;
    const size = isLast
      ? remaining
      : Math.min(remaining, Math.round(n * TIER_WEIGHTS[tier]));
    tiers[tier] = finalOrder.slice(cursor, cursor + size);
    cursor += size;
    remaining -= size;
  });

  return tiers;
}
