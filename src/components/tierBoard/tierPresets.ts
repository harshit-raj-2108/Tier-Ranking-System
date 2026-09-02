import type { TierKey } from "../../types";

export interface TierPreset {
  label: string;
  description: string;
  color: string;
  text: string;
}

export const TIER_PRESETS: Record<TierKey, TierPreset> = {
  S: { label: "S", description: "The best of the best", color: "#c9962f", text: "#161f1a" },
  A: { label: "A", description: "Really strong", color: "#9ba3a0", text: "#161f1a" },
  B: { label: "B", description: "Solid pick", color: "#b8814f", text: "#161f1a" },
  C: { label: "C", description: "Middle of the pack", color: "#4f6b46", text: "#f5f3e8" },
  D: { label: "D", description: "Below average", color: "#47617a", text: "#f5f3e8" },
  E: { label: "E", description: "Rarely reach for it", color: "#9a8d70", text: "#161f1a" },
  F: { label: "F", description: "Bottom of the list", color: "#7c4a56", text: "#f5f3e8" },
};
