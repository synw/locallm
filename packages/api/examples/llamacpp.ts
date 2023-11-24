#!/usr/bin/env node
import { Lm } from "../src/api.js";

const template = "<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n";

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
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.5,
    max_tokens: 200,
    stop: ["<|im_end|>"],
  });
  //console.log("\n", res)
}

(async () => {
  await main();
})();