import { useEffect, useState } from "react";
import { getModeLabel } from "../../shared/promptTemplates";
import type { ThinkingModeId } from "../../shared/modes";

interface PromptOutputProps {
  modeId: ThinkingModeId;
  prompt: string;
  disabled: boolean;
  onCopied: () => void;
}

export default function PromptOutput({ modeId, prompt, disabled, onCopied }: PromptOutputProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [prompt]);

  async function handleCopy(): Promise<void> {
    if (disabled) {
      return;
    }

    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    onCopied();
  }

  return (
    <section className="panel-section" aria-labelledby="prompt-heading">
      <div className="prompt-header">
        <div>
          <p className="section-kicker">Generated prompt</p>
          <h2 id="prompt-heading">{getModeLabel(modeId)} prompt</h2>
        </div>
        <button className="secondary-button" type="button" disabled={disabled} onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <textarea className="prompt-output" value={prompt} readOnly rows={13} aria-label="Generated prompt" />
    </section>
  );
}
