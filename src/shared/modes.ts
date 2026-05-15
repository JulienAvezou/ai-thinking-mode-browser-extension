export type ThinkingModeId = "explore" | "challenge" | "decide" | "audit" | "reflect";

export interface ThinkingMode {
  id: ThinkingModeId;
  label: string;
  summary: string;
}

export const THINKING_MODES: Record<ThinkingModeId, ThinkingMode> = {
  explore: {
    id: "explore",
    label: "Explore",
    summary: "Use when you do not fully understand the problem yet."
  },
  challenge: {
    id: "challenge",
    label: "Challenge",
    summary: "Use when you have a plan, but it might be wrong."
  },
  decide: {
    id: "decide",
    label: "Decide",
    summary: "Use when you need to choose between options."
  },
  audit: {
    id: "audit",
    label: "Audit",
    summary: "Use when you need to verify quality or correctness."
  },
  reflect: {
    id: "reflect",
    label: "Reflect",
    summary: "Use when you want to learn from what you did."
  }
};

export const MODE_ORDER: ThinkingModeId[] = ["explore", "challenge", "decide", "audit", "reflect"];
