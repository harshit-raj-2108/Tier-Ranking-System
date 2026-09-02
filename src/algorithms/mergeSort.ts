import type {
  ComparisonHistoryEntry,
  ComparisonSnapshot,
  ComparisonState,
} from "../types";

const MAX_HISTORY = 50;

function estimateComparisons(n: number): number {
  if (n <= 1) return 0;
  return Math.ceil(n * Math.log2(n));
}

export interface NextComparison {
  itemAId: string;
  itemBId: string;
}

export interface AdvanceResult {
  state: ComparisonState;
  next: NextComparison | null;
}

/**
 * Iterative bottom-up merge sort, driven one comparison at a time.
 *
 * Runs a pass over `runs`, merging adjacent pairs into `nextRuns`
 * (doubling run width each pass) until a single run remains. Whenever
 * a pair can be resolved without asking the user - one run already
 * exhausted, or an odd run left over at the end of a pass - it's
 * flushed automatically; only genuine head-to-head comparisons are
 * surfaced as `next`. Because every field consumed here is flat,
 * JSON-serializable state, this same function handles both "what's
 * the very first comparison" and "resume mid-sort after reload" -
 * there's no separate resume path.
 */
function advance(state: ComparisonState): AdvanceResult {
  let { runs, nextRuns, cursorA, cursorB, mergedRun, pairIndex } = state;

  while (true) {
    if (runs.length <= 1) {
      return {
        state: {
          ...state,
          runs,
          nextRuns,
          cursorA,
          cursorB,
          mergedRun,
          pairIndex,
          status: "complete",
          finalOrder: runs[0] ?? [],
        },
        next: null,
      };
    }

    if (pairIndex >= runs.length) {
      // Pass complete - the merged runs become this pass's input.
      runs = nextRuns;
      nextRuns = [];
      pairIndex = 0;
      cursorA = 0;
      cursorB = 0;
      mergedRun = [];
      continue;
    }

    if (pairIndex === runs.length - 1) {
      // Odd run left over this pass - carries through untouched.
      nextRuns = [...nextRuns, runs[pairIndex]];
      pairIndex += 1;
      continue;
    }

    const left = runs[pairIndex];
    const right = runs[pairIndex + 1];

    if (cursorA >= left.length) {
      nextRuns = [...nextRuns, [...mergedRun, ...right.slice(cursorB)]];
      mergedRun = [];
      cursorA = 0;
      cursorB = 0;
      pairIndex += 2;
      continue;
    }

    if (cursorB >= right.length) {
      nextRuns = [...nextRuns, [...mergedRun, ...left.slice(cursorA)]];
      mergedRun = [];
      cursorA = 0;
      cursorB = 0;
      pairIndex += 2;
      continue;
    }

    return {
      state: { ...state, runs, nextRuns, cursorA, cursorB, mergedRun, pairIndex },
      next: { itemAId: left[cursorA], itemBId: right[cursorB] },
    };
  }
}

/** Builds the initial state for a fresh sort of the given item IDs. */
export function createComparisonState(itemIds: string[]): ComparisonState {
  const initial: ComparisonState = {
    status: "not_started",
    runs: itemIds.map((id) => [id]),
    nextRuns: [],
    cursorA: 0,
    cursorB: 0,
    mergedRun: [],
    pairIndex: 0,
    history: [],
    totalComparisonsEstimate: estimateComparisons(itemIds.length),
    comparisonsMade: 0,
  };
  // Resolves the N<2 edge cases (immediate completion) uniformly;
  // for N>=2 the first pair never needs flushing, so this is a no-op.
  return advance(initial).state;
}

/** Marks an already-created, not-yet-touched sort as under way. */
export function startComparison(state: ComparisonState): ComparisonState {
  if (state.status !== "not_started") return state;
  return { ...state, status: "in_progress" };
}

/** What pair (if any) should be shown next; also resumes mid-sort state as-is. */
export function getNextComparison(state: ComparisonState): AdvanceResult {
  return advance(state);
}

/** Applies the user's pick and fast-forwards through any auto-resolved steps. */
export function recordComparison(state: ComparisonState, winnerId: string): ComparisonState {
  const left = state.runs[state.pairIndex];
  const right = state.runs[state.pairIndex + 1];
  const wonLeft = winnerId === left[state.cursorA];

  const snapshotBefore: ComparisonSnapshot = {
    runs: state.runs,
    nextRuns: state.nextRuns,
    cursorA: state.cursorA,
    cursorB: state.cursorB,
    mergedRun: state.mergedRun,
    pairIndex: state.pairIndex,
    comparisonsMade: state.comparisonsMade,
  };

  const historyEntry: ComparisonHistoryEntry = {
    itemAId: left[state.cursorA],
    itemBId: right[state.cursorB],
    winnerId,
    snapshotBefore,
  };

  const picked: ComparisonState = {
    ...state,
    mergedRun: [...state.mergedRun, winnerId],
    cursorA: wonLeft ? state.cursorA + 1 : state.cursorA,
    cursorB: wonLeft ? state.cursorB : state.cursorB + 1,
    comparisonsMade: state.comparisonsMade + 1,
    history: [...state.history, historyEntry].slice(-MAX_HISTORY),
  };

  return advance(picked).state;
}

/** Restores the state to exactly before the last recorded comparison. */
export function undoLastComparison(state: ComparisonState): ComparisonState {
  if (state.history.length === 0) return state;
  const lastEntry = state.history[state.history.length - 1];
  return {
    ...state,
    ...lastEntry.snapshotBefore,
    history: state.history.slice(0, -1),
    status: "in_progress",
    finalOrder: undefined,
  };
}
