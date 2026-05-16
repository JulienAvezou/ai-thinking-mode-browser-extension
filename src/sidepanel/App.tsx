import { useEffect, useMemo, useState } from "react";
import ModeForm from "./components/ModeForm";
import PromptOutput from "./components/PromptOutput";
import RecommendationCard from "./components/RecommendationCard";
import AiUsageLogger from "./components/AiUsageLogger";
import { THINKING_MODES, type ThinkingModeId } from "../shared/modes";
import { getModeRecommendation } from "../shared/recommendationEngine";
import { generatePrompt } from "../shared/promptTemplates";
import { createUsageEvent } from "../shared/usageEvents";
import { recordEvent } from "@integrations/eventRecorder";
import { isAiProvider, type UsageEventProvider } from "../shared/messages";

export default function App() {
  const [task, setTask] = useState("");
  const [selectedMode, setSelectedMode] = useState<ThinkingModeId>("explore");
  const [recommendationReason, setRecommendationReason] = useState("");
  const [hasRecommendation, setHasRecommendation] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState<UsageEventProvider>("unknown");

  const selectedModeDetails = THINKING_MODES[selectedMode];
  const generatedPrompt = useMemo(
    () => generatePrompt(selectedMode, task),
    [selectedMode, task],
  );

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      return;
    }

    chrome.storage.local.get("currentProvider").then(({ currentProvider }) => {
      if (isAiProvider(currentProvider)) {
        setProvider(currentProvider);
      }
    });
  }, []);

  function handleCheckMode(): void {
    if (!task.trim()) {
      setError("Describe your task first.");
      setHasRecommendation(false);
      return;
    }

    const recommendation = getModeRecommendation(task);
    setSelectedMode(recommendation.mode.id);
    setRecommendationReason(recommendation.reason);
    setHasRecommendation(true);
    setError("");

    void recordEvent(
      createUsageEvent({
        name: "ModeRecommended",
        provider,
        modeId: recommendation.mode.id,
        payload: {
          inputLength: task.trim().length,
        },
      }),
    );
    void recordEvent(
      createUsageEvent({
        name: "PromptGenerated",
        provider,
        modeId: recommendation.mode.id,
        payload: {
          taskLength: task.trim().length,
        },
      }),
    );
  }

  function handleModeChange(nextMode: ThinkingModeId): void {
    const previousMode = selectedMode;
    setSelectedMode(nextMode);
    setHasRecommendation(true);
    setRecommendationReason(
      "You manually selected this mode. The prompt has been regenerated for that workflow.",
    );
    setError("");

    void recordEvent(
      createUsageEvent({
        name: "ModeChangedManually",
        provider,
        modeId: nextMode,
        payload: {
          fromModeId: previousMode,
          taskLength: task.trim().length,
        },
      }),
    );
    void recordEvent(
      createUsageEvent({
        name: "PromptGenerated",
        provider,
        modeId: nextMode,
        payload: {
          taskLength: task.trim().length,
        },
      }),
    );
  }

  function handlePromptCopied(): void {
    void recordEvent(
      createUsageEvent({
        name: "PromptCopied",
        provider,
        modeId: selectedMode,
        payload: {},
      }),
    );
  }

  function handleCtaClick(): void {
    void recordEvent(
      createUsageEvent({
        name: "CtaClicked",
        provider,
        modeId: selectedMode,
        payload: {
          location: "sidepanel",
        },
      }),
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Prompt studio</p>
        <h1>ThinkingMode</h1>
        <p className="lede">
          Choose the right thinking mode before prompting AI.
        </p>
      </header>

      <ModeForm
        error={error}
        selectedMode={selectedMode}
        task={task}
        onCheckMode={handleCheckMode}
        onModeChange={handleModeChange}
        onTaskChange={setTask}
      />

      {hasRecommendation ? (
        <RecommendationCard
          mode={selectedModeDetails}
          reason={recommendationReason}
        />
      ) : null}

      <PromptOutput
        modeId={selectedMode}
        prompt={generatedPrompt}
        disabled={!task.trim()}
        onCopied={handlePromptCopied}
      />

      <AiUsageLogger />

      <section className="cta-panel" aria-label="Thinking Engineer Toolkit">
        <p>
          Want the full system for using AI without outsourcing your judgment?
        </p>
        <a
          href="https://javz.gumroad.com/l/the-thinking-engineer-toolkit"
          target="_blank"
          rel="noreferrer"
          onClick={handleCtaClick}
        >
          Get the Thinking Engineer Toolkit
        </a>
      </section>

      <p className="privacy-note">
        This open-source build does not transmit data, read conversations, or
        send analytics.
      </p>
    </main>
  );
}
