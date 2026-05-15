import type { ThinkingModeId } from "./modes";

export type AiProvider = "chatgpt" | "claude" | "gemini";
export type UsageEventProvider = AiProvider | "unknown";

export function isAiProvider(value: unknown): value is AiProvider {
  return value === "chatgpt" || value === "claude" || value === "gemini";
}

export interface OpenSidePanelMessage {
  type: "OPEN_SIDEPANEL";
  provider: AiProvider;
}

export type ExtensionMessage = OpenSidePanelMessage;

export const USAGE_EVENT_SCHEMA_VERSION = 1;

export type UsageEventName =
  | "ModeRecommended"
  | "PromptGenerated"
  | "PromptCopied"
  | "ModeChangedManually"
  | "CtaClicked";

interface UsageEventBase<TName extends UsageEventName, TPayload extends object> {
  schemaVersion: typeof USAGE_EVENT_SCHEMA_VERSION;
  name: TName;
  timestamp: string;
  provider: UsageEventProvider;
  modeId: ThinkingModeId;
  payload: TPayload;
}

export interface ModeRecommendedPayload {
  inputLength: number;
}

export interface PromptGeneratedPayload {
  taskLength: number;
}

export type PromptCopiedPayload = Record<string, never>;

export interface ModeChangedManuallyPayload {
  fromModeId: ThinkingModeId;
  taskLength: number;
}

export interface CtaClickedPayload {
  location: "sidepanel";
}

export type UsageEvent =
  | UsageEventBase<"ModeRecommended", ModeRecommendedPayload>
  | UsageEventBase<"PromptGenerated", PromptGeneratedPayload>
  | UsageEventBase<"PromptCopied", PromptCopiedPayload>
  | UsageEventBase<"ModeChangedManually", ModeChangedManuallyPayload>
  | UsageEventBase<"CtaClicked", CtaClickedPayload>;
