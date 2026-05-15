import { detectProvider } from "./detector";
import { injectFloatingButton, removeFloatingButton } from "./floatingButton";
import type { AiProvider, ExtensionMessage } from "../shared/messages";

let lastUrl = "";

function syncThinkingModeButton(): void {
  const provider = detectProvider();

  if (!provider) {
    removeFloatingButton();
    return;
  }

  injectFloatingButton({
    provider,
    onClick: openSidePanel
  });
}

function openSidePanel(provider: AiProvider): void {
  const message: ExtensionMessage = {
    type: "OPEN_SIDEPANEL",
    provider
  };

  chrome.runtime.sendMessage(message);
}

function watchSpaNavigation(): void {
  lastUrl = window.location.href;

  const notifyIfUrlChanged = () => {
    if (window.location.href === lastUrl) {
      return;
    }

    lastUrl = window.location.href;
    syncThinkingModeButton();
  };

  const observer = new MutationObserver(() => {
    notifyIfUrlChanged();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function pushState(...args) {
    originalPushState.apply(this, args);
    notifyIfUrlChanged();
  };

  window.history.replaceState = function replaceState(...args) {
    originalReplaceState.apply(this, args);
    notifyIfUrlChanged();
  };

  window.addEventListener("popstate", notifyIfUrlChanged);
}

syncThinkingModeButton();
watchSpaNavigation();
