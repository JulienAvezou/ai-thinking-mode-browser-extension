import {
  USAGE_EVENT_SCHEMA_VERSION,
  type UsageEvent,
  type UsageEventName,
  type UsageEventProvider,
} from "./messages";
import type { ThinkingModeId } from "./modes";

type UsageEventPayloadByName = {
  [TEvent in UsageEvent as TEvent["name"]]: TEvent["payload"];
};

interface CreateUsageEventOptions<TName extends UsageEventName> {
  name: TName;
  provider: UsageEventProvider;
  modeId: ThinkingModeId;
  payload: UsageEventPayloadByName[TName];
}

export function createUsageEvent<TName extends UsageEventName>({
  name,
  provider,
  modeId,
  payload,
}: CreateUsageEventOptions<TName>): UsageEvent {
  return {
    schemaVersion: USAGE_EVENT_SCHEMA_VERSION,
    name,
    timestamp: new Date().toISOString(),
    provider,
    modeId,
    payload,
  } as UsageEvent;
}
