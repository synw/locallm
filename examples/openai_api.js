#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

const system = "You are a helpful assistant";
const _prompt = "list the planet of the solar system. Ouptut only the list";

async function main() {
    const lm = new Lm({
        providerType: "openai",
        serverUrl: "http://localhost:5001/v1", // koboldcpp
        onToken: (t) => process.stdout.write(t),
    });
    process.on('SIGINT', () => {
        lm.abort().then(() => process.exit());
    });
    const res = await lm.infer(_prompt, {
        stream: true,
        temperature: 0.5,
    }, { system: system });
    console.log("\n\n", res)
}

(async () => {
    await main();
})();