# ThinkMode Architecture

ThinkMode is a local-first Manifest V3 Chrome extension that helps developers choose an intentional thinking mode before prompting AI. The project is intentionally scoped as a privacy-preserving browser tool: it runs on supported AI chat pages, opens a side panel workflow, generates deterministic prompt scaffolds, and tracks manual AI usage without reading conversations or sending data to a backend.

This document is written to make the engineering decisions behind that scope easy to evaluate.

## System Overview

```text
Supported AI chat page
  |
  | content script
  | - detects provider and SPA navigation
  | - injects the ThinkMode floating button
  | - renders cooldown overlay when needed
  v
Chrome extension runtime
  |
  | background service worker
  | - validates messages from content scripts
  | - stores current provider context
  | - opens the Chrome side panel
  v
React side panel
  |
  | local app logic
  | - recommends a thinking mode
  | - generates prompt templates
  | - logs manual AI usage
  | - syncs cooldown state to chat pages
```

The main architectural boundary is between page-facing code and extension UI code. Content scripts handle only DOM injection, provider detection, page navigation changes, and temporary blocking behavior. The side panel owns user input, recommendation state, prompt generation, and the cognitive cost workflow.

## Frontend

The frontend is a React 19 and TypeScript side panel built with Vite. The side panel is the primary product surface and is composed from focused components:

- `ModeForm` captures the user's task and selected thinking mode.
- `RecommendationCard` explains the selected mode and recommendation reason.
- `PromptOutput` renders the generated prompt and handles copy interactions.
- `AiUsageLogger` manages manual AI usage logging and the cognitive cost meter.

The UI keeps business logic in shared modules instead of embedding it in components. Recommendation rules live in `src/shared/recommendationEngine.ts`, prompt generation lives in `src/shared/promptTemplates.ts`, and AI usage accounting lives in `src/shared/aiUsageModes.ts`. This keeps React responsible for interaction state while making the core behavior testable without a browser.

The content script frontend is separate from the React app. It injects a minimal floating button into supported AI chat pages and uses a cooldown overlay when the cognitive cost meter fills. It also watches SPA navigation by combining DOM mutation observation, `history.pushState`, `history.replaceState`, and `popstate`, so ThinkMode remains accurate as AI chat apps change routes without full page reloads.

## Backend

There is no hosted backend in the open-source build. That is an intentional privacy and product decision, not an omitted dependency.

The extension uses the Chrome Manifest V3 background service worker as its runtime coordination layer. The service worker:

- configures the Chrome side panel behavior on install;
- validates incoming extension messages with typed guards;
- records the current AI provider in Chrome local storage;
- opens the side panel for the active tab.

This gives the project the coordination benefits of a backend-like control plane while keeping all execution inside the browser.

## Database And Storage

ThinkMode does not use a remote database. It uses browser-local persistence with a narrow data model:

- side panel `localStorage` stores the AI usage log, meter reset timestamp, and active cooldown;
- `chrome.storage.local` mirrors the active cooldown timestamp so content scripts on supported chat pages can block input while the pause is active;
- `chrome.storage.local` also stores the current provider context after the floating button opens the side panel.

The storage layer is defensive. `readAiUsageState` normalizes unknown stored values, ignores malformed entries, supports a legacy storage key, trims history to a bounded number of entries, and clears expired cooldowns. This protects the UI from stale or corrupted browser state.

No conversation text, generated prompt text, or raw task text is stored in analytics events. Usage events include only metadata such as provider, mode id, timestamps, schema version, and text lengths.

## Auth

The project has no authentication layer because there is no server-side identity, multi-user account state, billing gate, or private remote resource. Chrome extension permissions are the relevant access-control boundary.

The manifest grants only the permissions needed for the current product:

- `sidePanel` to show the extension UI;
- `storage` to synchronize local extension state;
- host permissions limited to ChatGPT, Claude, and Gemini pages.

Keeping auth out of this build reduces security surface area and supports the local-first privacy model.

## AI Integration

ThinkMode does not call an LLM API and does not scrape, read, or mutate AI chat conversations. Its AI integration is workflow-level rather than model-level.

The product supports AI use through deterministic, inspectable logic:

- provider detection maps supported HTTPS hostnames to known AI providers;
- mode recommendation uses keyword-based rules with explicit priority ordering;
- prompt templates are generated locally from the selected thinking mode and the user's task;
- manual usage logging helps developers reflect on how they used AI after prompting.

This approach makes the extension predictable, cheap to run, privacy-preserving, and easy to test. It also leaves a clean extension point for future analytics or model-backed recommendations through `src/integrations/eventRecorder.ts`, which is currently implemented as a no-op recorder in the open-source build.

## Deployment

The project builds with Vite and TypeScript:

```bash
pnpm build
```

The build performs a type check, creates the extension bundles, and runs `scripts/copy-static.mjs` to copy static manifest assets into `dist/`. Vite is configured with multiple Rollup entry points:

- `src/sidepanel/sidepanel.html` for the React side panel;
- `src/background/serviceWorker.ts` for the Manifest V3 service worker;
- `src/content/contentScript.ts` for the injected page script.

The generated `dist/` directory is loaded into Chrome through `chrome://extensions` using "Load unpacked" during development. The same output is the basis for packaging and Chrome Web Store submission.

## Testing Strategy

The test script focuses on source-level behavior that carries the highest regression risk:

- deterministic mode recommendations;
- prompt template generation and task trimming;
- supported provider detection;
- message provider type guards;
- privacy-preserving usage event payloads;
- no-op event recorder behavior;
- AI usage cost accumulation, cooldown timing, legacy storage handling, and formatting.

Tests are run with:

```bash
pnpm test
```

This test shape matches the architecture: most business logic is kept in shared TypeScript modules, so it can be tested without launching Chrome.

## Engineering Tradeoffs

The project favors deterministic local behavior over remote personalization. That limits advanced recommendations, but it provides clear privacy guarantees and avoids backend operational complexity.

The extension uses simple local storage rather than a full database because the state is small, user-local, and non-collaborative. The code still treats stored values as untrusted input and normalizes them before use.

The background service worker is intentionally thin. Most logic is kept in side panel and shared modules, which reduces Manifest V3 lifecycle complexity and makes the behavior easier to test.

The event recorder is abstracted even though the current implementation is a no-op. This preserves the open-source build's privacy stance while creating a controlled integration point for future telemetry or product analytics without spreading analytics logic through the UI.

## Key Files

```text
src/manifest.json                    Chrome extension permissions and entry points
src/background/serviceWorker.ts       Side panel orchestration and message validation
src/content/contentScript.ts          Page integration and SPA navigation watcher
src/content/detector.ts               Supported AI provider detection
src/content/cooldownBlocker.ts        Chat-page cooldown overlay and input blocking
src/sidepanel/App.tsx                 Main React side panel workflow
src/sidepanel/components/             Side panel UI components
src/shared/recommendationEngine.ts    Deterministic thinking-mode recommendation logic
src/shared/promptTemplates.ts         Local prompt template generation
src/shared/aiUsageModes.ts            Cognitive cost state machine
src/shared/messages.ts                Typed extension messages and usage event contracts
src/integrations/eventRecorder.ts     Analytics integration boundary, no-op by default
vite.config.ts                        Multi-entry extension build configuration
scripts/run-tests.mjs                 Source-level regression tests
```
