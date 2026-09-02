import { describe, expect, it } from "vitest";
import { TIER_ORDER } from "../types";
import { bucketIntoTiers } from "./tierBucketing";

describe("bucketIntoTiers", () => {
  it.each([0, 1, 5, 7, 8, 20, 100])(
    "covers every item exactly once across all 7 tiers for N=%i",
    (n) => {
      const order = Array.from({ length: n }, (_, i) => `item-${i}`);
      const tiers = bucketIntoTiers(order);

      expect(Object.keys(tiers).sort()).toEqual([...TIER_ORDER].sort());

      const flattened = TIER_ORDER.flatMap((tier) => tiers[tier]);
      expect(flattened).toHaveLength(n);
      expect(new Set(flattened)).toEqual(new Set(order));
      // Order within/across tiers preserves the input's best-first order.
      expect(flattened).toEqual(order);
    },
  );
});
