#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

const template = `<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant`;

async function main() {
  const lm = new Lm({
    providerType: "koboldcpp",
    serverUrl: "http://localhost:5001",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });
  //await lm.loadModel("");
  const _prompt = template.replace("{prompt}", "list the planet of the solar system");
  console.log('Prompt:', _prompt + "\n");
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.5,
    max_tokens: 300,
  });
  console.log("\n", res)
}

(async () => {
  await main();
})();