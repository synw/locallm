#!/usr/bin/env node
import { Lm } from "../dist/main.es.js";
import fs from "fs";

/**
 * 
 * Model:
    https://huggingface.co/mys/ggml_bakllava-1/resolve/main/ggml-model-q4_k.gguf
 * Projector:
    https://huggingface.co/mys/ggml_bakllava-1/resolve/main/mmproj-model-f16.gguf
 */

const prompt = "USER:[img-1] Describe the image in detail.\nASSISTANT:";

function toBase64(filePath) {
  const img = fs.readFileSync(filePath);
  return Buffer.from(img).toString('base64');
}

async function main() {
  let base64Image = toBase64("./img/llama.jpeg");
  const lm = new Lm({
    providerType: "koboldcpp",
    serverUrl: "http://localhost:5001",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });
  const res = await lm.infer(prompt, {
    stream: true,
    temperature: 0,
    max_tokens: 200,
    images: [base64Image],
    stop: ["</s>"],
  });
  //console.log("\n", res)
}

(async () => {
  await main();
})();