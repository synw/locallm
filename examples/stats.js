#!/usr/bin/env node

import pkg from 'ervy';
import { Lm } from "../packages/api/dist/main.js";
import { PromptTemplate } from 'modprompt';
const { bar, bg } = pkg;

const model = "qwen4b";
const template = "chatml";

async function main ()
{
  const lm = new Lm({
    providerType: "llamacpp",
    serverUrl: "http://localhost:8080",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () =>
  {
    lm.abort().then(() => process.exit());
  });
  await lm.loadModel(model, 8192);
  console.log("Loaded model", lm.model);
  const _prompt = new PromptTemplate(template).prompt("tell me a short story about a language model");
  console.log(_prompt);
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.8,
    max_tokens: 2000,
    model: { name: model, ctx: 2048 }
  });
  console.log("\n\Stats:\n", res.stats);
  const data = [
    { key: "Ingest ", value: res.stats.ingestionTimeSeconds, style: bg('blue') },
    { key: "Infer ", value: res.stats.inferenceTimeSeconds, style: bg('green') },
    { key: "Total", value: res.stats.totalTimeSeconds, style: bg('yellow') },
  ];
  console.log("\n", bar(data));
  console.log(" Total tokens emitted:", res.stats.totalTokens);
  console.log(" Tokens per second:", res.stats.tokensPerSecond);
}

(async () =>
{
  await main();
})();