export type CategoryId =
  | "beverages"
  | "board-games"
  | "books"
  | "brews"
  | "characters"
  | "comics"
  | "food"
  | "movies"
  | "music"
  | "people"
  | "places"
  | "sports"
  | "toys"
  | "tv-shows"
  | "video-games"
  | "other";

export interface RankingItem {
  id: string;
  name: string;
  imageUrl?: string;
  note?: string;
}

export const TIER_ORDER = ["S", "A", "B", "C", "D", "E", "F"] as const;
export type TierKey = (typeof TIER_ORDER)[number];

export type TierAssignment = Record<TierKey, string[]>;

export interface TierOverride {
  label?: string;
  description?: string;
  color?: string;
}

export type TierOverrides = Partial<Record<TierKey, TierOverride>>;

/**
 * Snapshot of the mutable merge-sort cursor fields, captured before a
 * comparison is recorded so undo can restore it verbatim instead of
 * computing an inverse merge step.
 */
export interface ComparisonSnapshot {
  runs: string[][];
  nextRuns: string[][];
  cursorA: number;
  cursorB: number;
  mergedRun: string[];
  pairIndex: number;
  comparisonsMade: number;
}

export interface ComparisonHistoryEntry {
  itemAId: string;
  itemBId: string;
  winnerId: string;
  snapshotBefore: ComparisonSnapshot;
}

export type ComparisonStatus = "not_started" | "in_progress" | "complete";

export interface ComparisonState {
  status: ComparisonStatus;
  runs: string[][];
  nextRuns: string[][];
  cursorA: number;
  cursorB: number;
  mergedRun: string[];
  pairIndex: number;
  history: ComparisonHistoryEntry[];
  totalComparisonsEstimate: number;
  comparisonsMade: number;
  finalOrder?: string[];
}

export interface RankingList {
  id: string;
  name: string;
  category: CategoryId;
  items: RankingItem[];
  comparison: ComparisonState;
  tiers: TierAssignment;
  tierOverrides?: TierOverrides;
  createdAt: string;
  updatedAt: string;
}

export interface StorageSchema {
  version: 1;
  rankings: RankingList[];
}
