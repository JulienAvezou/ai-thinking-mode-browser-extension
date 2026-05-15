import { THINKING_MODES, type ThinkingMode, type ThinkingModeId } from "./modes";

export function generatePrompt(mode: ThinkingMode | ThinkingModeId, task: string): string {
  const modeId = typeof mode === "string" ? mode : mode.id;
  const cleanTask = task.trim();
  const taskText = cleanTask || "[Describe your task here]";

  const templates: Record<ThinkingModeId, string> = {
    explore: `I want to explore this problem before jumping to implementation:

${taskText}

Help me understand the problem space. Ask clarifying questions, identify hidden assumptions, explain the key concepts I need, and suggest what I should investigate next. Keep the focus on understanding before proposing a solution.`,
    challenge: `I have a plan or direction, but I want you to challenge it:

${taskText}

Act as a skeptical senior engineer. Identify weak assumptions, edge cases, failure modes, unnecessary complexity, and simpler alternatives. Do not agree too quickly. End with the strongest objections I should resolve before proceeding.`,
    decide: `I need to make a decision about this:

${taskText}

Compare the options using tradeoffs, constraints, reversibility, implementation complexity, maintainability, and risk. End with a recommendation, explain why, and describe what new information would change that recommendation.`,
    audit: `Please audit this for quality and correctness:

${taskText}

Review for correctness, bugs, missing tests, edge cases, security or reliability concerns, overengineering, and maintainability. Prioritize the most important issues first and separate must-fix problems from nice-to-have improvements.`,
    reflect: `I want to learn from this task:

${taskText}

Help me extract the learning. Identify what I understood, what I may have outsourced to AI, what reusable pattern I should remember, and one explain-back question I should be able to answer in my own words.`
  };

  return templates[modeId];
}

export function getModeLabel(mode: ThinkingModeId): string {
  return THINKING_MODES[mode].label;
}
