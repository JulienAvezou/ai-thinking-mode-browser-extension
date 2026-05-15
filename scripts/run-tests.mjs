import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const root = resolve(new URL("..", import.meta.url).pathname);

async function loadJoinedModule(files) {
  const source = files
    .map((file) => readFileSync(resolve(root, file), "utf8"))
    .join("\n")
    .replace(/import[\s\S]*?from\s+["'][^"']+["'];?/g, "");

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });

  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(outputText)}`);
}

const modesAndRecommendations = await loadJoinedModule([
  "src/shared/modes.ts",
  "src/shared/recommendationEngine.ts",
]);

const modesAndPrompts = await loadJoinedModule([
  "src/shared/modes.ts",
  "src/shared/promptTemplates.ts",
]);

const detector = await loadJoinedModule(["src/content/detector.ts"]);

const usageEvents = await loadJoinedModule([
  "src/shared/modes.ts",
  "src/shared/messages.ts",
  "src/shared/usageEvents.ts",
]);

const recorder = await loadJoinedModule(["src/integrations/eventRecorder.ts"]);

const recommendationCases = [
  ["I need to review this PR for edge cases", "audit"],
  ["Compare Supabase vs Firebase and choose one", "decide"],
  ["I have a plan, does this make sense?", "challenge"],
  ["What is RAG and how does it work?", "explore"],
  ["Retrospective: what did I learn from this task?", "reflect"],
  ["Should I use queues or cron?", "decide"],
  ["Can you test whether my assumptions are wrong?", "audit"],
];

for (const [input, expectedMode] of recommendationCases) {
  assert.equal(modesAndRecommendations.getModeRecommendation(input).mode.id, expectedMode);
}

assert.equal(modesAndRecommendations.getModeRecommendation("").mode.id, "explore");

for (const modeId of Object.keys(modesAndPrompts.THINKING_MODES)) {
  const prompt = modesAndPrompts.generatePrompt(modeId, "  Build auth  ");
  assert.match(prompt, /Build auth/);
  assert.doesNotMatch(prompt, /  Build auth  /);
}

assert.equal(detector.detectProvider("https://chatgpt.com/c/abc"), "chatgpt");
assert.equal(detector.detectProvider("https://chat.openai.com/"), "chatgpt");
assert.equal(detector.detectProvider("https://claude.ai/new"), "claude");
assert.equal(detector.detectProvider("https://gemini.google.com/app"), "gemini");
assert.equal(detector.detectProvider("http://chatgpt.com/"), null);
assert.equal(detector.detectProvider("https://example.com/"), null);
assert.equal(detector.detectProvider("not a url"), null);

for (const provider of ["chatgpt", "claude", "gemini"]) {
  assert.equal(usageEvents.isAiProvider(provider), true);
}

for (const provider of ["openai", "CHATGPT", "", null, undefined, 42, {}, []]) {
  assert.equal(usageEvents.isAiProvider(provider), false);
}

const rawTask = "raw task text that must not leave the UI";
const rawPrompt = "generated prompt text that must not leave the UI";
const event = usageEvents.createUsageEvent({
  name: "PromptGenerated",
  provider: "chatgpt",
  modeId: "audit",
  payload: {
    taskLength: rawTask.length,
  },
});

assert.equal(event.schemaVersion, usageEvents.USAGE_EVENT_SCHEMA_VERSION);
assert.equal(event.provider, "chatgpt");
assert.equal(event.modeId, "audit");
assert.equal(event.payload.taskLength, rawTask.length);
assert.doesNotMatch(JSON.stringify(event), new RegExp(rawTask));
assert.doesNotMatch(JSON.stringify(event), new RegExp(rawPrompt));

assert.equal(await recorder.recordEvent(event), undefined);

console.log("All tests passed.");
