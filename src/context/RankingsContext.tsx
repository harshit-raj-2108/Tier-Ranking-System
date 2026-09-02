import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
import {
  createComparisonState,
  recordComparison as recordComparisonAlgo,
  startComparison as startComparisonAlgo,
  undoLastComparison as undoLastComparisonAlgo,
} from "../algorithms/mergeSort";
import { bucketIntoTiers } from "../algorithms/tierBucketing";
import { loadAll, saveAll } from "../storage/storage";
import {
  TIER_ORDER,
  type CategoryId,
  type ComparisonState,
  type RankingItem,
  type RankingList,
  type TierAssignment,
  type TierKey,
  type TierOverride,
} from "../types";

export type ViewState =
  | { view: "landing" }
  | { view: "rankings-library" }
  | { view: "item-builder"; rankingId: string }
  | { view: "comparison"; rankingId: string }
  | { view: "tier-board"; rankingId: string };

const SAVE_DEBOUNCE_MS = 300;

function nowISO(): string {
  return new Date().toISOString();
}

function emptyComparisonState(): ComparisonState {
  return {
    status: "not_started",
    runs: [],
    nextRuns: [],
    cursorA: 0,
    cursorB: 0,
    mergedRun: [],
    pairIndex: 0,
    history: [],
    totalComparisonsEstimate: 0,
    comparisonsMade: 0,
  };
}

function emptyTiers(): TierAssignment {
  return TIER_ORDER.reduce((acc, tier) => {
    acc[tier] = [];
    return acc;
  }, {} as TierAssignment);
}

type Action =
  | { type: "CREATE_RANKING"; ranking: RankingList }
  | { type: "RENAME_RANKING"; rankingId: string; name: string }
  | { type: "DELETE_RANKING"; rankingId: string }
  | { type: "ADD_ITEM"; rankingId: string; item: RankingItem }
  | {
      type: "UPDATE_ITEM";
      rankingId: string;
      itemId: string;
      patch: Partial<Omit<RankingItem, "id">>;
    }
  | { type: "REMOVE_ITEM"; rankingId: string; itemId: string }
  | { type: "START_COMPARISON"; rankingId: string }
  | { type: "RECORD_COMPARISON"; rankingId: string; winnerId: string }
  | { type: "UNDO_COMPARISON"; rankingId: string }
  | {
      type: "MOVE_TIER_ITEM";
      rankingId: string;
      itemId: string;
      toTier: TierKey;
      toIndex: number;
    }
  | {
      type: "UPDATE_TIER_OVERRIDE";
      rankingId: string;
      tier: TierKey;
      override: TierOverride;
    };

function rankingsReducer(rankings: RankingList[], action: Action): RankingList[] {
  switch (action.type) {
    case "CREATE_RANKING":
      return [...rankings, action.ranking];

    case "RENAME_RANKING":
      return rankings.map((r) =>
        r.id === action.rankingId
          ? { ...r, name: action.name, updatedAt: nowISO() }
          : r,
      );

    case "DELETE_RANKING":
      return rankings.filter((r) => r.id !== action.rankingId);

    case "ADD_ITEM":
      return rankings.map((r) =>
        r.id === action.rankingId
          ? { ...r, items: [...r.items, action.item], updatedAt: nowISO() }
          : r,
      );

    case "UPDATE_ITEM":
      return rankings.map((r) =>
        r.id === action.rankingId
          ? {
              ...r,
              items: r.items.map((item) =>
                item.id === action.itemId ? { ...item, ...action.patch } : item,
              ),
              updatedAt: nowISO(),
            }
          : r,
      );

    case "REMOVE_ITEM":
      return rankings.map((r) =>
        r.id === action.rankingId
          ? {
              ...r,
              items: r.items.filter((item) => item.id !== action.itemId),
              updatedAt: nowISO(),
            }
          : r,
      );

    case "START_COMPARISON":
      return rankings.map((r) => {
        if (r.id !== action.rankingId || r.comparison.status !== "not_started") {
          return r;
        }
        const comparison = startComparisonAlgo(
          createComparisonState(r.items.map((item) => item.id)),
        );
        return { ...r, comparison, updatedAt: nowISO() };
      });

    case "RECORD_COMPARISON":
      return rankings.map((r) => {
        if (r.id !== action.rankingId) return r;
        const comparison = recordComparisonAlgo(r.comparison, action.winnerId);
        const tiers =
          comparison.status === "complete" && comparison.finalOrder
            ? bucketIntoTiers(comparison.finalOrder)
            : r.tiers;
        return { ...r, comparison, tiers, updatedAt: nowISO() };
      });

    case "UNDO_COMPARISON":
      return rankings.map((r) =>
        r.id === action.rankingId
          ? {
              ...r,
              comparison: undoLastComparisonAlgo(r.comparison),
              updatedAt: nowISO(),
            }
          : r,
      );

    case "MOVE_TIER_ITEM":
      return rankings.map((r) => {
        if (r.id !== action.rankingId) return r;
        const tiers: TierAssignment = { ...r.tiers };
        for (const tier of TIER_ORDER) {
          tiers[tier] = tiers[tier].filter((id) => id !== action.itemId);
        }
        const destination = [...tiers[action.toTier]];
        const clampedIndex = Math.min(Math.max(action.toIndex, 0), destination.length);
        destination.splice(clampedIndex, 0, action.itemId);
        tiers[action.toTier] = destination;
        return { ...r, tiers, updatedAt: nowISO() };
      });

    case "UPDATE_TIER_OVERRIDE":
      return rankings.map((r) =>
        r.id === action.rankingId
          ? {
              ...r,
              tierOverrides: {
                ...r.tierOverrides,
                [action.tier]: {
                  ...r.tierOverrides?.[action.tier],
                  ...action.override,
                },
              },
              updatedAt: nowISO(),
            }
          : r,
      );

    default:
      return rankings;
  }
}

interface RankingsContextValue {
  rankings: RankingList[];
  viewState: ViewState;
  navigate: (view: ViewState) => void;
  getRanking: (rankingId: string) => RankingList | undefined;
  createRanking: (category: CategoryId) => string;
  renameRanking: (rankingId: string, name: string) => void;
  deleteRanking: (rankingId: string) => void;
  addItem: (rankingId: string, item: Omit<RankingItem, "id">) => void;
  updateItem: (
    rankingId: string,
    itemId: string,
    patch: Partial<Omit<RankingItem, "id">>,
  ) => void;
  removeItem: (rankingId: string, itemId: string) => void;
  startComparison: (rankingId: string) => void;
  recordComparison: (rankingId: string, winnerId: string) => void;
  undoComparison: (rankingId: string) => void;
  moveTierItem: (
    rankingId: string,
    itemId: string,
    toTier: TierKey,
    toIndex: number,
  ) => void;
  updateTierOverride: (
    rankingId: string,
    tier: TierKey,
    override: TierOverride,
  ) => void;
}

const RankingsContext = createContext<RankingsContextValue | null>(null);

export function RankingsProvider({ children }: { children: ReactNode }) {
  const [rankings, dispatch] = useReducer(
    rankingsReducer,
    undefined,
    () => loadAll().rankings,
  );
  const [viewState, setViewState] = useState<ViewState>({ view: "landing" });
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveAll({ version: 1, rankings });
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [rankings]);

  // If the tab closes mid-debounce, flush immediately rather than losing
  // the last few seconds of edits.
  useEffect(() => {
    const flush = () => saveAll({ version: 1, rankings });
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [rankings]);

  const value: RankingsContextValue = {
    rankings,
    viewState,
    navigate: setViewState,
    getRanking: (rankingId) => rankings.find((r) => r.id === rankingId),

    createRanking: (category) => {
      const id = nanoid();
      const ranking: RankingList = {
        id,
        name: `${category
          .split("-")
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join(" ")} Ranking`,
        category,
        items: [],
        comparison: emptyComparisonState(),
        tiers: emptyTiers(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      dispatch({ type: "CREATE_RANKING", ranking });
      return id;
    },

    renameRanking: (rankingId, name) => dispatch({ type: "RENAME_RANKING", rankingId, name }),
    deleteRanking: (rankingId) => dispatch({ type: "DELETE_RANKING", rankingId }),

    addItem: (rankingId, item) =>
      dispatch({ type: "ADD_ITEM", rankingId, item: { id: nanoid(), ...item } }),
    updateItem: (rankingId, itemId, patch) =>
      dispatch({ type: "UPDATE_ITEM", rankingId, itemId, patch }),
    removeItem: (rankingId, itemId) => dispatch({ type: "REMOVE_ITEM", rankingId, itemId }),

    startComparison: (rankingId) => dispatch({ type: "START_COMPARISON", rankingId }),
    recordComparison: (rankingId, winnerId) =>
      dispatch({ type: "RECORD_COMPARISON", rankingId, winnerId }),
    undoComparison: (rankingId) => dispatch({ type: "UNDO_COMPARISON", rankingId }),

    moveTierItem: (rankingId, itemId, toTier, toIndex) =>
      dispatch({ type: "MOVE_TIER_ITEM", rankingId, itemId, toTier, toIndex }),
    updateTierOverride: (rankingId, tier, override) =>
      dispatch({ type: "UPDATE_TIER_OVERRIDE", rankingId, tier, override }),
  };

  return <RankingsContext.Provider value={value}>{children}</RankingsContext.Provider>;
}

export function useRankings(): RankingsContextValue {
  const ctx = useContext(RankingsContext);
  if (!ctx) throw new Error("useRankings must be used within a RankingsProvider");
  return ctx;
}
