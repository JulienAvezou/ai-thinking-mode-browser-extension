import type { AiProvider } from "../shared/messages";

const BUTTON_ID = "thinkingmode-floating-button";

export interface FloatingButtonOptions {
  provider: AiProvider;
  onClick: (provider: AiProvider) => void;
}

export function injectFloatingButton({ provider, onClick }: FloatingButtonOptions): void {
  const existing = document.getElementById(BUTTON_ID);

  if (existing) {
    existing.dataset.provider = provider;
    return;
  }

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.textContent = "ThinkingMode";
  button.dataset.provider = provider;
  button.setAttribute("aria-label", "Open ThinkingMode side panel");
  button.addEventListener("click", () => onClick(provider));

  document.documentElement.appendChild(button);
}

export function removeFloatingButton(): void {
  document.getElementById(BUTTON_ID)?.remove();
}
