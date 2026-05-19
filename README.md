# ThinkMode

ThinkMode is a Manifest V3 Chrome extension MVP that helps developers choose a thinking mode before prompting AI. The open-source build runs locally on supported AI chat pages and does not read conversations, scrape page content, call an LLM API, transmit data, or collect analytics.

<img width="3016" height="2558" alt="ThinkMode" src="https://github.com/user-attachments/assets/8db97611-8555-410a-9b79-9f1032aea884" />

## Supported Pages

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://claude.ai/*`
- `https://gemini.google.com/*`

## What It Does

- Detects supported AI chat pages by hostname.
- Injects a small floating ThinkMode button.
- Opens a Chrome side panel from that button.
- Lets you describe your task.
- Recommends one of five deterministic thinking modes: Explore, Challenge, Decide, Audit, Reflect.
- Generates a local prompt template for the selected mode.
- Lets you manually copy the generated prompt.
- Lets you manually log how you used AI after prompting.
- Shows a cognitive cost meter that rises faster for riskier usage modes.
- Temporarily blocks supported AI chat pages for 5 minutes when the meter fills.

## AI Usage Log and Cognitive Cost

The AI usage log is a manual tracker for the mode you used after prompting. Modes are grouped into Supportive, Mixed, and Risky categories:

- Supportive modes help expand your thinking and carry a low cognitive cost.
- Mixed modes save time but can compress understanding if used carelessly.
- Risky modes are cases where AI may replace your judgment and carry a high cognitive cost.

The cognitive cost meter lives in browser `localStorage`. When the meter reaches its limit, ThinkMode mirrors the active cooldown timestamp to Chrome local storage so supported chat pages can show a blocking overlay for 5 minutes. After the cooldown ends, the meter resets locally.

<img width="1207" height="803" alt="Capture d’écran 2026-05-16 à 12 30 01" src="https://github.com/user-attachments/assets/a53fb214-ee8b-4c86-9de9-6d184cd6b191" />

## Privacy

ThinkMode only uses text you type into the side panel and the AI usage modes you manually log. The open-source build does not read AI conversations, scrape page content, automatically insert prompts, send data to a backend, or use analytics.

## Setup

Install dependencies:

```bash
pnpm install
```

Run a production build:

```bash
pnpm build
```

Run source-level logic tests:

```bash
pnpm test
```

For iterative UI development:

```bash
pnpm dev
```

The Chrome extension build is emitted to `dist/`.

## Load in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this repo's `dist/` directory.
5. Visit a supported page such as `https://chatgpt.com/`.
6. Click the floating ThinkMode button.

## Testing Checklist

- The floating button appears only on supported hostnames.
- Clicking the button opens the Chrome side panel.
- Empty task input shows a validation error.
- `Check mode` recommends the expected mode using deterministic keyword rules.
- Manual mode switching regenerates the prompt.
- Copy shows `Copied` feedback.
- AI usage groups expand and collapse.
- Logging AI usage updates the cognitive cost meter.
- Filling the cognitive cost meter blocks supported chat pages for 5 minutes.
- The side panel privacy note is visible.
- The local event recorder remains a no-op and usage events contain metadata only.

## Project Structure

```text
src/
  background/
    serviceWorker.ts
  content/
    contentScript.ts
    detector.ts
    floatingButton.ts
    content.css
  sidepanel/
    App.tsx
    main.tsx
    sidepanel.html
    components/
      ModeForm.tsx
      AiUsageLogger.tsx
      RecommendationCard.tsx
      PromptOutput.tsx
  shared/
    aiUsageModes.ts
    modes.ts
    recommendationEngine.ts
    promptTemplates.ts
    messages.ts
    usageEvents.ts
  integrations/
    eventRecorder.ts
```

## License

MIT
