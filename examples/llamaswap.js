#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

const models = ["qwen1.7b", "qwencoder1.5b"]

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
    model: { name: models[0], ctx: 8192 },
    stream: true,
    temperature: 0.5,
  });
  console.log("\nSwitching to model", models[1])
  await lm.infer(_prompt, {
    model: { name: models[1], ctx: 8192 },
    stream: true,
    temperature: 0.5,
  });
}

(async () => {
  await main();
})();