#!/usr/bin/env node
import { Lm } from "../src/api.js";

// to get the model used in this example:
// wget https://huggingface.co/s3nh/PY007-TinyLlama-1.1B-Chat-v0.2-GGUF/resolve/main/PY007-TinyLlama-1.1B-Chat-v0.2.Q8_0.gguf
const template = "<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n";

async function main() {
  const lm = new Lm({
    providerType: "koboldcpp",
    serverUrl: "http://localhost:5001",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });
  const _prompt = template.replace("{prompt}", "list the planet of the solar system names. Important: answer in json");
  await lm.infer(_prompt, {
    temperature: 0,
    top_p: 0.35,
    n_predict: 300,
  })
}

(async () => {
  await main();
})();