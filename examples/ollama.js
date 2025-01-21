#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

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

  await lm.modelsInfo();
  console.log("Models", lm.models);
  await lm.loadModel(model, 8192);
  console.log("Loaded model", lm.model);
  const _prompt = template.replace("{prompt}", "list the planets in the solar system. Answer in json");
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.1,
    max_tokens: 1024,
    extra: {
      format: "json"
    }
  });
  console.log("\n\nResult:\n", res)
}

(async () => {
  await main();
})();