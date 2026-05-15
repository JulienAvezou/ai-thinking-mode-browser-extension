# ThinkingMode

ThinkingMode is a Manifest V3 Chrome extension MVP that helps developers choose a thinking mode before prompting AI. The open-source build runs locally on supported AI chat pages and does not read conversations, scrape page content, call an LLM API, transmit data, or collect analytics.

<img width="3016" height="2558" alt="ThinkingMode" src="https://github.com/user-attachments/assets/8db97611-8555-410a-9b79-9f1032aea884" />

## Supported Pages

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://claude.ai/*`
- `https://gemini.google.com/*`

## What It Does

- Detects supported AI chat pages by hostname.
- Injects a small floating ThinkingMode button.
- Opens a Chrome side panel from that button.
- Lets you describe your task.
- Recommends one of five deterministic thinking modes: Explore, Challenge, Decide, Audit, Reflect.
- Generates a local prompt template for the selected mode.
- Lets you manually copy the generated prompt.

## Privacy

ThinkingMode only uses text you type into the side panel. The open-source build does not read AI conversations, scrape page content, automatically insert prompts, send data to a backend, or use analytics.

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
6. Click the floating ThinkingMode button.

## Testing Checklist

- The floating button appears only on supported hostnames.
- Clicking the button opens the Chrome side panel.
- Empty task input shows a validation error.
- `Check mode` recommends the expected mode using deterministic keyword rules.
- Manual mode switching regenerates the prompt.
- Copy shows `Copied` feedback.
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
      RecommendationCard.tsx
      PromptOutput.tsx
  shared/
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
