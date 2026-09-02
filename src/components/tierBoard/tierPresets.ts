import type { TierKey } from "../../types";

export interface TierPreset {
  label: string;
  description: string;
  color: string;
}

export const TIER_PRESETS: Record<TierKey, TierPreset> = {
  S: { label: "S", description: "The Best Choice", color: "#e8607a" },
  A: { label: "A", description: "2nd Choice", color: "#eab064" },
  B: { label: "B", description: "Good But Not Great", color: "#e8cf5c" },
  C: { label: "C", description: "This is average", color: "#7cbf6e" },
  D: { label: "D", description: "Slightly Below Average", color: "#5fc9d6" },
  E: { label: "E", description: "Below Average", color: "#5b95d9" },
  F: { label: "F", description: "Worst Choice", color: "#9c72d6" },
};
