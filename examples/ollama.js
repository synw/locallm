#!/usr/bin/env node
import { PromptTemplate } from "modprompt";
import { Lm } from "../packages/api/dist/main.js";

const model = "gemma2:2b-instruct-q8_0";
const template = new PromptTemplate("gemma");

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
  const _prompt = template.prompt("list the planets in the solar system. Answer in json");
  console.log("P", _prompt);
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.1,
    max_tokens: 1024,
    extra: {
      format: "json",
      raw: true,
    }
  });
  console.log("\n\nResult:\n", res)
}

(async () => {
  await main();
})();