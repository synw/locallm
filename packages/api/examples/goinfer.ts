#!/usr/bin/env node
import { Lm } from "../src/api.js";

// to get the model used in this example:
// wget https://huggingface.co/TheBloke/TinyLlama-1.1B-1T-OpenOrca-GGUF/resolve/main/tinyllama-1.1b-1t-openorca.Q8_0.gguf
const model = "tinyllama-1.1b-1t-openorca.Q8_0.gguf"
const apiKey = "7aea109636aefb984b13f9b6927cd174425a1e05ab5f2e3935ddfeb183099465";
const template = "<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n";

async function main() {
  const lm = new Lm({
    providerType: "goinfer",
    serverUrl: "http://localhost:5143",
    apiKey: apiKey,
    onToken: (t) => process.stdout.write(t),
    onStartEmit: (data) => console.log("Thinking time:", data["thinking_time_format"]),
  });
  await lm.loadModel(model, 4096);
  const _prompt = template.replace("{prompt}", "list the planets in the solar system");
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.1,
    top_p: 0.55,
    n_predict: 200,
  });
  console.log("Result:", res)
}

(async () => {
  await main();
})();