import { isAiProvider, type ExtensionMessage } from "../shared/messages";

function isExtensionMessage(message: unknown): message is ExtensionMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === "OPEN_SIDEPANEL" &&
    "provider" in message &&
    isAiProvider(message.provider)
  );
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
    // Older Chrome versions may not support this behavior. The content button still opens the panel.
  });
});

chrome.runtime.onMessage.addListener((message: unknown, sender) => {
  if (!isExtensionMessage(message)) {
    return;
  }

  if (sender.tab?.id !== undefined) {
    chrome.storage.local.set({ currentProvider: message.provider });
    chrome.sidePanel.open({ tabId: sender.tab.id });
  }
});
