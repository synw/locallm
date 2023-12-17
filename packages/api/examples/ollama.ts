#!/usr/bin/env node
import { Lm } from "../src/api.js";

const template = "<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n";

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
  await lm.loadModel(lm.models[0].name);
  //console.log("Model", lm.model);
  const _prompt = template.replace("{prompt}", "list the planets in the solar system");
  const res = await lm.infer(_prompt, {
    temperature: 0.1,
    top_p: 0.55,
    top_k: 20,
    max_tokens: 200,
    stop: ["<|im_end|>"],
  });
  console.log("\n\nResult:\n", res)
}

(async () => {
  await main();
})();