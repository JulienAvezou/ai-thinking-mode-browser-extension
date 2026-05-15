import { THINKING_MODES, type ThinkingMode, type ThinkingModeId } from "./modes";

export interface ModeRecommendation {
  mode: ThinkingMode;
  reason: string;
}

const KEYWORDS: Record<ThinkingModeId, string[]> = {
  explore: ["understand", "learn basics", "confused", "what is", "how does"],
  challenge: ["i have a plan", "does this make sense", "is this approach", "challenge", "assumption", "wrong"],
  decide: ["choose", "compare", "option", "tradeoff", "should i use", "which"],
  audit: ["review", "check", "verify", "correct", "bug", "security", "test", "edge case"],
  reflect: ["learn from", "retrospective", "what did i learn", "improve next time", "reflection"]
};

const PRIORITY: ThinkingModeId[] = ["audit", "decide", "challenge", "reflect", "explore"];

export function recommendMode(input: string): ThinkingMode {
  return getModeRecommendation(input).mode;
}

export function getModeRecommendation(input: string): ModeRecommendation {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return {
      mode: THINKING_MODES.explore,
      reason: "Explore is the safest starting point when the task is not defined yet."
    };
  }

  const matchedMode = PRIORITY.find((mode) => KEYWORDS[mode].some((keyword) => normalized.includes(keyword)));
  const mode = THINKING_MODES[matchedMode ?? "explore"];

  return {
    mode,
    reason: getRecommendationReason(mode.id, matchedMode === undefined)
  };
}

function getRecommendationReason(mode: ThinkingModeId, usedDefault: boolean): string {
  if (usedDefault) {
    return "Your task does not strongly signal a later-stage workflow, so start by clarifying the problem space.";
  }

  const reasons: Record<ThinkingModeId, string> = {
    explore: "Your task sounds like it needs clarification and concept-building before implementation.",
    challenge: "Your wording suggests you already have a direction and need pressure-testing before committing.",
    decide: "Your task involves comparing paths or making a choice under constraints.",
    audit: "Your task is about checking correctness, quality, tests, security, or edge cases.",
    reflect: "Your task is focused on extracting learning and improving how you work next time."
  };

  return reasons[mode];
}
