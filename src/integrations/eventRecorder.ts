import type { UsageEvent } from "../shared/messages";

export interface EventRecorder {
  record(event: UsageEvent): void | Promise<void>;
}

const noopEventRecorder: EventRecorder = {
  record(_event) {
    // The open-source build is intentionally local-first: no storage, analytics, or network calls.
  },
};

export const eventRecorder: EventRecorder = noopEventRecorder;

export function recordEvent(event: UsageEvent): void | Promise<void> {
  return eventRecorder.record(event);
}
