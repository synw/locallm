#!/usr/bin/env node

import pkg from 'ervy';
import { Lm } from "../packages/api/dist/main.js";
const { bar, bg } = pkg;

const model = "mistral:instruct";
const template = "[INST] {prompt} [/INST]";

async function main() {
  const lm = new Lm({
    providerType: "ollama",
    serverUrl: "http://localhost:11434",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });
  await lm.loadModel(model, 8192);
  console.log("Loaded model", lm.model);
  const _prompt = template.replace("{prompt}", "tell me a short story about a language model");
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.8,
    max_tokens: 2000,
  });
  console.log("\n\Stats:\n", res.stats);
  const data = [
    { key: "Think", value: res.stats.ingestionTimeSeconds, style: bg('blue') },
    { key: "Infer", value: res.stats.inferenceTimeSeconds, style: bg('green') },
    { key: "Total", value: res.stats.totalTimeSeconds, style: bg('yellow') },
  ];
  console.log("\n", bar(data));
  console.log(" Total tokens emitted:", res.stats.totalTokens);
  console.log(" Tokens per second:", res.stats.tokensPerSecond);
}

(async () => {
  await main();
})();