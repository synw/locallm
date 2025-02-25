#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";
import { PromptTemplate } from "modprompt";

const model = "minicpm-v:8b-2.6-q8_0";
const template = new PromptTemplate("chatml");
const _prompt = "Describe the image in details";
const _imageUrl = "https://loremflickr.com/320/240?random=1"

async function convertImagePathToBase64(imageUrl) {

}

async function convertImageUrlToBase64(imageUrl) {
  // Validate URL format
  const urlRegex = /^(http|https):\/\/[^\s]+$/;
  if (!urlRegex.test(imageUrl)) {
    throw new Error('Invalid image URL provided');
  }
  let mimeType;
  return fetch(imageUrl, {
    method: 'GET',
    headers: {
      'Accept': 'image/*'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch image: Status ${response.status}`);
      }
      // Store MIME type before processing data
      mimeType = response.headers.get('content-type') || 'image/jpeg';
      return response.arrayBuffer();
    })
    .then(buffer => {
      const base64String = Buffer.from(buffer).toString('base64');
      return `data:${mimeType};base64,${base64String}`;
    })
    .catch(error => {
      throw new Error(`Failed to fetch image: ${error.message}`);
    });
}

async function main() {
  const lm = new Lm({
    providerType: "ollama",
    serverUrl: "http://localhost:11434",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });

  const img = await convertImageUrlToBase64(_imageUrl);

  await lm.loadModel(model, 8192);
  console.log("Loaded model", lm.model);
  const res = await lm.infer(template.prompt(_prompt), {
    stream: true,
    temperature: 0.1,
    max_tokens: 1024,
    images: [img],
    extra: {
      format: "json"
    }
  });
  console.log("\n\nResult:\n", res)
}

(async () => {
  await main();
})();