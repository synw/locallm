#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

const system = "You are a helpful assistant";
const _prompt = "list the planet of the solar system. Ouptut only the list";
const serverUrl = "http://localhost:8080/v1"; // llamacpp or llama-swap
const model = "qwen1.7b-t"; // llama-swap
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
    const res = await lm.infer(_prompt, {
        stream: true,
        temperature: 0.5,
        model: { name: model },
        max_tokens: 2048,
        ctx: 4096,
    }, { system: system, debug: true });
    console.log("\n\n", res)
}

(async () =>
{
    await main();
})();