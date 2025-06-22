#!/usr/bin/env node
import { PromptTemplate } from "modprompt";
import { Lm } from "../packages/api/dist/main.js";

const model = "qwen3:30b";
const template = new PromptTemplate("chatml");

async function main() {
  const lm = new Lm({
    providerType: "ollama",
    serverUrl: "http://localhost:11434",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });

  await lm.modelsInfo();
  //console.log("Models", lm.models);
  await lm.loadModel(model, 8192);
  console.log("Loaded model", lm.model);
  const _prompt = template.prompt("list the planets in the solar system sorted by gravity in percentage of Earth's gravity");
  console.log("Prompt:", _prompt);
  const res = await lm.infer(_prompt, {
    stream: true,
    ctx: 16384,
    top_p: 0.95,
    top_k: 20,
    min_p: 0,
    temperature: 0.4,
    max_tokens: 8192,
    extra: {
      //format: "json",
      raw: true,
    }
  });
  console.log("\n\nResult:\n", res)
}

(async () => {
  await main();
})();