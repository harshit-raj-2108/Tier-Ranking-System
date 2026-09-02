import { describe, expect, it } from "vitest";
import {
  createComparisonState,
  getNextComparison,
  recordComparison,
  undoLastComparison,
} from "./mergeSort";

/** Runs a full sort against a fixed value table, higher value wins each pick. */
function runFullSort(values: number[]) {
  const ids = values.map((_, i) => `item-${i}`);
  const valueById = new Map(ids.map((id, i) => [id, values[i]]));

  let state = createComparisonState(ids);
  let comparisons = 0;

  while (true) {
    const { state: resolved, next } = getNextComparison(state);
    state = resolved;
    if (!next) break;

    const winner =
      valueById.get(next.itemAId)! >= valueById.get(next.itemBId)!
        ? next.itemAId
        : next.itemBId;
    state = recordComparison(state, winner);
    comparisons += 1;
  }

  return { finalState: state, ids, valueById, comparisons };
}

describe("mergeSort", () => {
  it.each([0, 1, 2, 3, 5, 8, 9, 16, 17, 50])(
    "produces a correct descending order for N=%i",
    (n) => {
      const values = Array.from({ length: n }, (_, i) => i);
      // Shuffle deterministically so the input isn't already sorted.
      for (let i = values.length - 1; i > 0; i--) {
        const j = (i * 2654435761) % (i + 1);
        [values[i], values[j]] = [values[j], values[i]];
      }

      const { finalState, ids, valueById } = runFullSort(values);

      expect(finalState.status).toBe("complete");
      expect(finalState.finalOrder).toBeDefined();
      expect(finalState.finalOrder).toHaveLength(n);
      expect(new Set(finalState.finalOrder)).toEqual(new Set(ids));

      const orderedValues = finalState.finalOrder!.map((id) => valueById.get(id));
      const expected = [...orderedValues].sort((a, b) => b! - a!);
      expect(orderedValues).toEqual(expected);
    },
  );

  it("uses O(N log N) comparisons, not O(N^2)", () => {
    const values = Array.from({ length: 200 }, (_, i) => i);
    const { comparisons } = runFullSort(values);
    // Upper bound with slack; a quadratic implementation would need ~19900.
    expect(comparisons).toBeLessThan(200 * Math.log2(200) * 1.5);
  });

  it("undo restores the exact previous comparison", () => {
    const values = [5, 3, 8, 1, 9, 2];
    const ids = values.map((_, i) => `item-${i}`);
    const valueById = new Map(ids.map((id, i) => [id, values[i]]));

    let state = createComparisonState(ids);
    const { state: firstResolved, next: firstPair } = getNextComparison(state);
    state = firstResolved;
    expect(firstPair).not.toBeNull();

    const before = state;
    const winner =
      valueById.get(firstPair!.itemAId)! >= valueById.get(firstPair!.itemBId)!
        ? firstPair!.itemAId
        : firstPair!.itemBId;
    const after = recordComparison(state, winner);

    expect(after.comparisonsMade).toBe(before.comparisonsMade + 1);

    const undone = undoLastComparison(after);
    expect(undone.comparisonsMade).toBe(before.comparisonsMade);
    expect(undone.runs).toEqual(before.runs);
    expect(undone.mergedRun).toEqual(before.mergedRun);
    expect(undone.cursorA).toBe(before.cursorA);
    expect(undone.cursorB).toBe(before.cursorB);

    const { next: pairAfterUndo } = getNextComparison(undone);
    expect(pairAfterUndo).toEqual(firstPair);
  });

  it("undo is a no-op with empty history", () => {
    const state = createComparisonState(["a", "b"]);
    expect(undoLastComparison(state)).toBe(state);
  });
});
