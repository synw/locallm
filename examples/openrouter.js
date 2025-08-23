#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

// set the OPENROUTER_API_KEY env variable before running this

const system = "You are a helpful assistant";
const _prompt = "list the planet of the solar system. Output only the list";
const model = "google/gemma-3n-e2b-it:free";

async function main() {
    const lm = new Lm({
        providerType: "openai",
        serverUrl: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        onToken: (t) => process.stdout.write(t),
    });
    process.on('SIGINT', () => {
        lm.abort().then(() => process.exit());
    });
    const res = await lm.infer(_prompt, {
        stream: true,
        temperature: 0.5,
        extra: { system: system, model: model }
    });
    console.log("\n\n", res)
}

(async () => {
    await main();
})();