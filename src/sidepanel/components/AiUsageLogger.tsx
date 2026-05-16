import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  AI_USAGE_COOLDOWN_STORAGE_KEY,
  AI_USAGE_GROUP_ORDER,
  AI_USAGE_GROUPS,
  AI_USAGE_MODE_ORDER,
  AI_USAGE_MODES,
  COGNITIVE_COST_LIMIT,
  formatCooldown,
  getCognitiveCostPercent,
  getCooldownRemainingMs,
  getCurrentCognitiveCost,
  getRecentUsageEntries,
  logAiUsageMode,
  readAiUsageState,
  saveAiUsageState,
  type AiUsageModeId,
  type AiUsageState,
} from "../../shared/aiUsageModes";

type ModeStyle = CSSProperties & {
  "--mode-color": string;
};

export default function AiUsageLogger() {
  const [now, setNow] = useState(() => Date.now());
  const [usageState, setUsageState] = useState<AiUsageState>(() => readAiUsageState(window.localStorage));
  const [lastLoggedMode, setLastLoggedMode] = useState<AiUsageModeId | null>(null);

  const cost = getCurrentCognitiveCost(usageState, now);
  const percent = getCognitiveCostPercent(usageState, now);
  const cooldownRemainingMs = getCooldownRemainingMs(usageState, now);
  const isCoolingDown = cooldownRemainingMs > 0;
  const recentEntries = useMemo(() => getRecentUsageEntries(usageState), [usageState]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const normalizedState = readAiUsageState(window.localStorage, now);

    if (normalizedState.cooldownUntil !== usageState.cooldownUntil) {
      setUsageState(normalizedState);
      saveAiUsageState(window.localStorage, normalizedState);
    }
  }, [now, usageState.cooldownUntil]);

  useEffect(() => {
    void syncCooldownWithChatPages(usageState.cooldownUntil);
  }, [usageState.cooldownUntil]);

  function handleLog(modeId: AiUsageModeId): void {
    const nextState = logAiUsageMode(usageState, modeId);
    setUsageState(nextState);
    saveAiUsageState(window.localStorage, nextState);
    setLastLoggedMode(modeId);
  }

  return (
    <section className="panel-section usage-logger" aria-labelledby="usage-logger-heading">
      <div className="usage-header">
        <div>
          <p className="section-kicker">AI usage log</p>
          <h2 id="usage-logger-heading">Cognitive cost</h2>
          <p className="usage-lede">
            Log how you used AI after prompting so riskier modes carry visible cost.
          </p>
        </div>
        <div className={isCoolingDown ? "cost-pill cost-pill-blocked" : "cost-pill"}>
          {isCoolingDown ? `Paused ${formatCooldown(cooldownRemainingMs)}` : `${cost}/${COGNITIVE_COST_LIMIT}`}
        </div>
      </div>

      <div className="cost-meter" aria-label={`Cognitive cost meter at ${percent} percent`}>
        <div className="cost-meter-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className={isCoolingDown ? "usage-status usage-status-blocked" : "usage-status"}>
        {isCoolingDown
          ? "Chat is blocked for a short reset. The meter clears when the pause ends."
          : "Log the mode you used after prompting. Riskier modes fill the meter faster."}
      </p>

      <div className="usage-groups">
        {AI_USAGE_GROUP_ORDER.map((groupId) => {
          const group = AI_USAGE_GROUPS[groupId];
          const modes = AI_USAGE_MODE_ORDER.filter((modeId) => AI_USAGE_MODES[modeId].groupId === groupId);

          return (
            <details className="usage-group" key={groupId} open>
              <summary className="usage-group-heading">
                <div>
                  <h3>{group.label}</h3>
                  <p>{group.summary}</p>
                </div>
                <span>{group.costLabel}</span>
              </summary>
              <div className="usage-mode-list">
                {modes.map((modeId) => {
                  const mode = AI_USAGE_MODES[modeId];
                  const isLastLogged = lastLoggedMode === modeId;

                  return (
                    <button
                      key={mode.id}
                      className={isLastLogged ? "usage-mode-button usage-mode-button-logged" : "usage-mode-button"}
                      disabled={isCoolingDown}
                      style={{ "--mode-color": mode.color } as ModeStyle}
                      type="button"
                      onClick={() => handleLog(mode.id)}
                    >
                      <span>{mode.label}</span>
                      <small>{mode.description}</small>
                    </button>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>

      {recentEntries.length > 0 ? (
        <div className="recent-usage" aria-label="Recent usage">
          <p>Recent</p>
          <ol>
            {recentEntries.map((entry) => (
              <li key={entry.id}>
                <span>{AI_USAGE_MODES[entry.modeId].label}</span>
                <span>+{entry.cost}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

async function syncCooldownWithChatPages(cooldownUntil: number | null): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return;
  }

  try {
    await chrome.storage.local.set({
      [AI_USAGE_COOLDOWN_STORAGE_KEY]: cooldownUntil,
    });
  } catch {
    // The logger still works locally if Chrome storage is unavailable in a dev preview.
  }
}
