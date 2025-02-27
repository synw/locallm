#!/usr/bin/env node
import { Lm, convertImageUrlToBase64 } from "../packages/api/dist/main.js";
import { PromptTemplate } from "modprompt";
import terminalImage from 'terminal-image';
import got from 'got';

const model = "minicpm-v:8b-2.6-q8_0";
const _prompt = "Describe the image in details";
const _imageUrl = "https://loremflickr.com/cache/resized/defaultImage.small_320_240_nofilter.jpg"

async function main() {
  const lm = new Lm({
    providerType: "ollama",
    serverUrl: "http://localhost:11434",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });

  const img = (await convertImageUrlToBase64(_imageUrl));

  await lm.loadModel(model, 8192);
  console.log("Loaded model", lm.model);
  const body = await got(_imageUrl).buffer();
  console.log(await terminalImage.buffer(body));
  const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.1,
    max_tokens: 1024,
    images: [img],
  });
  console.log("\n\Stats:\n", res.stats)
}

(async () => {
  await main();
})();
