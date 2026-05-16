export type AiUsageModeGroupId = "supportive" | "mixed" | "risky";

export type AiUsageModeId =
  | "explaining_unfamiliar_code"
  | "exploring_tradeoffs"
  | "critiquing_plan"
  | "testing_assumptions"
  | "clarifying_concepts"
  | "boilerplate_generation"
  | "refactoring_suggestions"
  | "drafting_documentation"
  | "blindly_accepting_generated_solutions"
  | "delegating_core_architecture_early"
  | "ai_defines_implementation_first"
  | "heavy_debugging_delegation";

export interface AiUsageModeGroup {
  id: AiUsageModeGroupId;
  label: string;
  summary: string;
  costLabel: string;
}

export interface AiUsageMode {
  id: AiUsageModeId;
  groupId: AiUsageModeGroupId;
  label: string;
  description: string;
  cost: number;
  color: string;
}

export interface AiUsageLogEntry {
  id: string;
  modeId: AiUsageModeId;
  loggedAt: number;
  cost: number;
}

export interface AiUsageState {
  entries: AiUsageLogEntry[];
  cooldownUntil: number | null;
  meterResetAt: number;
}

export const AI_USAGE_LOCAL_STORAGE_KEY = "thinkingmode.aiUsage.v1";
export const AI_USAGE_COOLDOWN_STORAGE_KEY = "thinkingmode.aiUsage.cooldownUntil.v1";
export const COGNITIVE_COST_LIMIT = 100;
export const COOLDOWN_DURATION_MS = 5 * 60 * 1000;

const MAX_STORED_ENTRIES = 200;

export const AI_USAGE_GROUPS: Record<AiUsageModeGroupId, AiUsageModeGroup> = {
  supportive: {
    id: "supportive",
    label: "Supportive",
    summary: "AI expands your thinking.",
    costLabel: "Low cost",
  },
  mixed: {
    id: "mixed",
    label: "Mixed",
    summary: "AI saves time, but can compress understanding.",
    costLabel: "Sizeable cost",
  },
  risky: {
    id: "risky",
    label: "Risky",
    summary: "AI can replace your judgment if used too early.",
    costLabel: "High cost",
  },
};

export const AI_USAGE_MODE_ORDER: AiUsageModeId[] = [
  "explaining_unfamiliar_code",
  "exploring_tradeoffs",
  "critiquing_plan",
  "testing_assumptions",
  "clarifying_concepts",
  "boilerplate_generation",
  "refactoring_suggestions",
  "drafting_documentation",
  "blindly_accepting_generated_solutions",
  "delegating_core_architecture_early",
  "ai_defines_implementation_first",
  "heavy_debugging_delegation",
];

export const AI_USAGE_MODES: Record<AiUsageModeId, AiUsageMode> = {
  explaining_unfamiliar_code: {
    id: "explaining_unfamiliar_code",
    groupId: "supportive",
    label: "Explaining unfamiliar code or architecture",
    description: "Use when the answer helps you build context.",
    cost: 8,
    color: "#0f766e",
  },
  exploring_tradeoffs: {
    id: "exploring_tradeoffs",
    groupId: "supportive",
    label: "Exploring tradeoffs",
    description: "Use when AI broadens the option set.",
    cost: 8,
    color: "#2563eb",
  },
  critiquing_plan: {
    id: "critiquing_plan",
    groupId: "supportive",
    label: "Critiquing a plan",
    description: "Use when AI pressure-tests your reasoning.",
    cost: 8,
    color: "#4f46e5",
  },
  testing_assumptions: {
    id: "testing_assumptions",
    groupId: "supportive",
    label: "Testing assumptions",
    description: "Use when AI looks for weak premises.",
    cost: 8,
    color: "#0891b2",
  },
  clarifying_concepts: {
    id: "clarifying_concepts",
    groupId: "supportive",
    label: "Clarifying concepts",
    description: "Use when AI makes an idea easier to reason about.",
    cost: 8,
    color: "#16a34a",
  },
  boilerplate_generation: {
    id: "boilerplate_generation",
    groupId: "mixed",
    label: "Boilerplate generation",
    description: "Useful speedup when you still inspect the shape.",
    cost: 24,
    color: "#b45309",
  },
  refactoring_suggestions: {
    id: "refactoring_suggestions",
    groupId: "mixed",
    label: "Refactoring suggestions",
    description: "Helpful if you keep ownership of the design.",
    cost: 24,
    color: "#7c3aed",
  },
  drafting_documentation: {
    id: "drafting_documentation",
    groupId: "mixed",
    label: "Drafting documentation",
    description: "Fast, but verify it matches the real system.",
    cost: 24,
    color: "#ca8a04",
  },
  blindly_accepting_generated_solutions: {
    id: "blindly_accepting_generated_solutions",
    groupId: "risky",
    label: "Blindly accepting generated solutions",
    description: "High risk because understanding can be skipped.",
    cost: 45,
    color: "#dc2626",
  },
  delegating_core_architecture_early: {
    id: "delegating_core_architecture_early",
    groupId: "risky",
    label: "Delegating core architecture too early",
    description: "High risk before constraints are clear.",
    cost: 45,
    color: "#be123c",
  },
  ai_defines_implementation_first: {
    id: "ai_defines_implementation_first",
    groupId: "risky",
    label: "Letting AI define implementation before deep thought",
    description: "High risk when AI sets direction before you do.",
    cost: 45,
    color: "#c2410c",
  },
  heavy_debugging_delegation: {
    id: "heavy_debugging_delegation",
    groupId: "risky",
    label: "Heavy debugging delegation without root cause",
    description: "High risk when fixes arrive before diagnosis.",
    cost: 45,
    color: "#db2777",
  },
};

export const AI_USAGE_GROUP_ORDER: AiUsageModeGroupId[] = ["supportive", "mixed", "risky"];

export function createInitialAiUsageState(): AiUsageState {
  return {
    entries: [],
    cooldownUntil: null,
    meterResetAt: 0,
  };
}

export function readAiUsageState(storage: Pick<Storage, "getItem">, now = Date.now()): AiUsageState {
  try {
    const rawValue = storage.getItem(AI_USAGE_LOCAL_STORAGE_KEY);

    if (!rawValue) {
      return createInitialAiUsageState();
    }

    return normalizeAiUsageState(JSON.parse(rawValue), now);
  } catch {
    return createInitialAiUsageState();
  }
}

export function saveAiUsageState(storage: Pick<Storage, "setItem">, state: AiUsageState): void {
  storage.setItem(AI_USAGE_LOCAL_STORAGE_KEY, JSON.stringify(state));
}

export function logAiUsageMode(state: AiUsageState, modeId: AiUsageModeId, now = Date.now()): AiUsageState {
  const normalizedState = normalizeAiUsageState(state, now);

  if (getCooldownRemainingMs(normalizedState, now) > 0) {
    return normalizedState;
  }

  const mode = AI_USAGE_MODES[modeId];
  const nextState = normalizeAiUsageState(
    {
      ...normalizedState,
      entries: [
        ...normalizedState.entries,
        {
          id: `${now}-${modeId}-${normalizedState.entries.length}`,
          modeId,
          loggedAt: now,
          cost: mode.cost,
        },
      ],
    },
    now,
  );

  if (getCurrentCognitiveCost(nextState, now) < COGNITIVE_COST_LIMIT) {
    return nextState;
  }

  const cooldownUntil = now + COOLDOWN_DURATION_MS;

  return {
    ...nextState,
    cooldownUntil,
    meterResetAt: cooldownUntil,
  };
}

export function getCurrentCognitiveCost(state: AiUsageState, now = Date.now()): number {
  const normalizedState = normalizeAiUsageState(state, now);

  if (getCooldownRemainingMs(normalizedState, now) > 0) {
    return COGNITIVE_COST_LIMIT;
  }

  return normalizedState.entries
    .filter((entry) => entry.loggedAt >= normalizedState.meterResetAt)
    .reduce((sum, entry) => sum + entry.cost, 0);
}

export function getCognitiveCostPercent(state: AiUsageState, now = Date.now()): number {
  return Math.min(100, Math.round((getCurrentCognitiveCost(state, now) / COGNITIVE_COST_LIMIT) * 100));
}

export function getCooldownRemainingMs(state: AiUsageState, now = Date.now()): number {
  if (typeof state.cooldownUntil !== "number") {
    return 0;
  }

  return Math.max(0, state.cooldownUntil - now);
}

export function getRecentUsageEntries(state: AiUsageState, limit = 3): AiUsageLogEntry[] {
  return [...state.entries].sort((left, right) => right.loggedAt - left.loggedAt).slice(0, limit);
}

export function formatCooldown(ms: number): string {
  const remainingSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function normalizeAiUsageState(value: unknown, now: number): AiUsageState {
  if (!isObject(value)) {
    return createInitialAiUsageState();
  }

  const rawEntries = Array.isArray(value.entries) ? value.entries : [];
  const meterResetAt = typeof value.meterResetAt === "number" ? value.meterResetAt : 0;
  const cooldownUntil = typeof value.cooldownUntil === "number" && value.cooldownUntil > now ? value.cooldownUntil : null;
  const entries = rawEntries
    .filter(isAiUsageLogEntry)
    .filter((entry) => AI_USAGE_MODES[entry.modeId] !== undefined)
    .slice(-MAX_STORED_ENTRIES);

  return {
    entries,
    cooldownUntil,
    meterResetAt,
  };
}

function isAiUsageLogEntry(value: unknown): value is AiUsageLogEntry {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.modeId === "string" &&
    typeof value.loggedAt === "number" &&
    typeof value.cost === "number"
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
