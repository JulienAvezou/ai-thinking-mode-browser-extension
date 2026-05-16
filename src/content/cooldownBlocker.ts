const AI_USAGE_COOLDOWN_STORAGE_KEY = "thinkingmode.aiUsage.cooldownUntil.v1";
const OVERLAY_ID = "thinkingmode-cooldown-overlay";

let cooldownUntil: number | null = null;
let renderIntervalId: number | null = null;

export function startCooldownBlocker(): void {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return;
  }

  chrome.storage.local
    .get(AI_USAGE_COOLDOWN_STORAGE_KEY)
    .then((storedValues) => {
      const storedCooldownUntil = storedValues[AI_USAGE_COOLDOWN_STORAGE_KEY];
      cooldownUntil = typeof storedCooldownUntil === "number" ? storedCooldownUntil : null;
      renderCooldownOverlay();
    })
    .catch(() => {
      cooldownUntil = null;
    });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[AI_USAGE_COOLDOWN_STORAGE_KEY]) {
      return;
    }

    const nextCooldownUntil = changes[AI_USAGE_COOLDOWN_STORAGE_KEY].newValue;
    cooldownUntil = typeof nextCooldownUntil === "number" ? nextCooldownUntil : null;
    renderCooldownOverlay();
  });

  window.addEventListener("keydown", blockKeyboardInput, true);
  window.addEventListener("beforeinput", blockInputEvent, true);
  window.addEventListener("paste", blockInputEvent, true);
}

function renderCooldownOverlay(): void {
  const remainingMs = getRemainingMs();

  if (remainingMs <= 0) {
    removeOverlay();
    return;
  }

  const overlay = getOrCreateOverlay();
  overlay.querySelector("strong")!.textContent = formatCooldown(remainingMs);

  if (renderIntervalId === null) {
    renderIntervalId = window.setInterval(renderCooldownOverlay, 1000);
  }
}

function getOrCreateOverlay(): HTMLElement {
  const existingOverlay = document.getElementById(OVERLAY_ID);

  if (existingOverlay) {
    return existingOverlay;
  }

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "ThinkingMode pause");
  overlay.innerHTML = `
    <div class="thinkingmode-cooldown-card">
      <p>ThinkingMode pause</p>
      <h2>Chat is blocked for <strong>5:00</strong></h2>
      <span>The cognitive cost meter filled up. Take a short reset before prompting again.</span>
    </div>
  `;

  document.documentElement.append(overlay);
  return overlay;
}

function removeOverlay(): void {
  document.getElementById(OVERLAY_ID)?.remove();

  if (renderIntervalId !== null) {
    window.clearInterval(renderIntervalId);
    renderIntervalId = null;
  }
}

function blockKeyboardInput(event: KeyboardEvent): void {
  if (getRemainingMs() <= 0) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
}

function blockInputEvent(event: Event): void {
  if (getRemainingMs() <= 0) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
}

function getRemainingMs(): number {
  if (typeof cooldownUntil !== "number") {
    return 0;
  }

  return Math.max(0, cooldownUntil - Date.now());
}

function formatCooldown(ms: number): string {
  const remainingSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
