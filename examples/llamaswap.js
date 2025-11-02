#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

const models = ["qwen1.7b", "qwen4b"]

const template = `<|im_start|>system
You are a helpful assistant<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant`;

async function main() {
  const lm = new Lm({
    providerType: "llamacpp",
    serverUrl: "http://localhost:8080",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });
  const _prompt = template.replace("{prompt}", "list the planet of the solar system");
  await lm.infer(_prompt, {
    model: { name: models[0] },
    stream: true,
    temperature: 0.5,
  }, { debug: true });
  console.log("\nSwitching to model", models[1]);
  await lm.infer(_prompt, {
    model: { name: models[1] },
    stream: true,
    temperature: 0.2,
  }, { debug: true });
}

(async () => {
  await main();
})();