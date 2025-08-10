#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

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
  console.log(await lm.info())
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });
  const _prompt = template.replace("{prompt}", "list the planet of the solar system");
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.5,
    stop: ["</s>"],
  });
  console.log("\n\n", res)
}

(async () => {
  await main();
})();