#!/usr/bin/env node
import { Lm, convertImageUrlToBase64 } from "../packages/api/dist/main.js";

const _prompt = "Describe the image in details";
const _imageUrl = "https://loremflickr.com/cache/resized/defaultImage.small_320_240_nofilter.jpg"
const serverUrl = "http://localhost:8080/v1"; // llamacpp or llama-swap
const model = "qwen4b-vl-t"; // llama-swap
const apiKey = "";
//const serverUrl = "https://openrouter.ai/api/v1";
//const model = "qwen/qwen3-4b:free";
//const apiKey = process.env.OPENROUTER_API_KEY;

async function main()
{
    const lm = new Lm({
        providerType: "openai",
        serverUrl: serverUrl,
        apiKey: apiKey,
        onToken: (t) => process.stdout.write(t),
    });
    process.on('SIGINT', () =>
    {
        lm.abort().then(() => process.exit());
    });
    const img = (await convertImageUrlToBase64(_imageUrl));
    const res = await lm.infer(_prompt, {
        temperature: 0.5,
        model: { name: model },
        max_tokens: 2048,
        ctx: 4096,
        images: [img],
    }, { debug: true });
    console.log("\n\n", res)
}

(async () =>
{
    await main();
})();