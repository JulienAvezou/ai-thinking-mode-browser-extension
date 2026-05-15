import type { AiProvider } from "../shared/messages";

const PROVIDERS_BY_HOSTNAME: Record<string, AiProvider> = {
  "chatgpt.com": "chatgpt",
  "chat.openai.com": "chatgpt",
  "claude.ai": "claude",
  "gemini.google.com": "gemini"
};

export function detectProvider(url: string = window.location.href): AiProvider | null {
  try {
    const { hostname, protocol } = new URL(url);

    if (protocol !== "https:") {
      return null;
    }

    return PROVIDERS_BY_HOSTNAME[hostname] ?? null;
  } catch {
    return null;
  }
}

export function isSupportedAiChatPage(url: string = window.location.href): boolean {
  return detectProvider(url) !== null;
}
