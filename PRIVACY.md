# ThinkMode Privacy Policy

Last updated: May 19, 2026

ThinkMode is a local-first Chrome extension for choosing AI prompting modes, manually logging AI usage, tracking cognitive cost, and temporarily pausing supported AI chat pages when the cognitive cost meter fills.

## Data ThinkMode Uses

ThinkMode may use the following data locally in your browser:

- Task text you type into the side panel to generate a local prompt template.
- The thinking mode you select or receive as a recommendation.
- Manual AI usage log entries you create by selecting a usage mode.
- Cognitive cost meter state and cooldown timestamps.
- The supported AI provider page where the side panel was opened, such as ChatGPT, Claude, or Gemini.

## How Data Is Stored

ThinkMode stores AI usage log data and cognitive cost meter state in your browser's local storage. It also uses Chrome extension local storage for small extension state, such as the current supported AI provider and active cooldown timestamp.

This data stays on your device. ThinkMode does not use a backend server.

## Data ThinkMode Does Not Collect

ThinkMode does not:

- Read your AI conversations.
- Scrape AI chat page content.
- Automatically insert prompts into chat pages.
- Transmit your task text, prompts, usage logs, or browsing activity to a server.
- Sell data.
- Use analytics, tracking pixels, advertising identifiers, or third-party telemetry.

## Supported Pages

ThinkMode runs only on these supported AI chat pages:

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://claude.ai/*`
- `https://gemini.google.com/*`

On these pages, ThinkMode injects a floating button. When the cognitive cost meter fills, ThinkMode may also show a temporary blocking overlay for 5 minutes.

## Permissions

ThinkMode requests Chrome extension permissions for:

- `sidePanel`: to show the ThinkMode side panel.
- `storage`: to store local extension state, usage logs, and cooldown state.
- Supported AI chat page host permissions: to inject the floating button and temporary cooldown overlay on those pages.

## Clearing Data

You can clear ThinkMode's local data by removing the extension from Chrome. You can also clear extension site data through Chrome's extension and browser storage tools.

## Changes

This policy may be updated when ThinkMode's behavior changes. The latest version should describe the data behavior of the published extension.

## Contact

For questions about this privacy policy, contact the extension publisher through the Chrome Web Store listing.
