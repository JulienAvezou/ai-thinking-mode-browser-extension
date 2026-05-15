import { MODE_ORDER, THINKING_MODES, type ThinkingModeId } from "../../shared/modes";

interface ModeFormProps {
  task: string;
  selectedMode: ThinkingModeId;
  error: string;
  onTaskChange: (task: string) => void;
  onCheckMode: () => void;
  onModeChange: (mode: ThinkingModeId) => void;
}

export default function ModeForm({
  task,
  selectedMode,
  error,
  onTaskChange,
  onCheckMode,
  onModeChange
}: ModeFormProps) {
  return (
    <section className="panel-section" aria-labelledby="task-label">
      <label id="task-label" htmlFor="task-input" className="field-label">
        What are you trying to do?
      </label>
      <textarea
        id="task-input"
        value={task}
        onChange={(event) => onTaskChange(event.target.value)}
        placeholder="Example: Compare whether I should use Supabase or Firebase for auth in this MVP."
        rows={7}
      />
      {error ? <p className="field-error">{error}</p> : null}

      <button className="primary-button" type="button" onClick={onCheckMode}>
        Check mode
      </button>

      <fieldset className="mode-switcher">
        <legend>Manual mode</legend>
        <div className="mode-grid">
          {MODE_ORDER.map((modeId) => (
            <button
              key={modeId}
              type="button"
              className={modeId === selectedMode ? "mode-chip mode-chip-active" : "mode-chip"}
              onClick={() => onModeChange(modeId)}
            >
              {THINKING_MODES[modeId].label}
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
