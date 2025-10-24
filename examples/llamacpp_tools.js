#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";
import { PromptTemplate } from "modprompt";

const tool1 = {
    "name": "get_current_weather",
    "description": "Get the current weather",
    "arguments": {
        "location": {
            "description": "The city and state, e.g. San Francisco, CA"
        }
    }
};

// using Qwen 4b
const template = new PromptTemplate("chatml-tools").addTool(tool1);
const prompt = "What is the current weather in London?";

async function main() {
    const lm = new Lm({
        providerType: "llamacpp",
        serverUrl: "http://localhost:8080",
        onToken: (t) => process.stdout.write(t),
    });
    process.on('SIGINT', () => {
        lm.abort().then(() => process.exit());
    });
    const _prompt = template.prompt(prompt);
    console.log("Submiting prompt:", _prompt);
    const res = await lm.infer(_prompt, {
        stream: true,
        temperature: 0.1,
        max_tokens: 4096
    });
    template.pushToHistory({ user: prompt, assistant: res.text });
    const { isToolCall, toolsCall, error } = template.processAnswer(res.text);
    if (error) {
        throw new Error(`Error processing the model's answer: ${error}`);
    }
    console.log("Is tool call:", isToolCall);
    if (isToolCall) {
        console.log("Tool calls:", toolsCall);
        const toolsTurns = [];
        toolsCall.forEach(tc => {
            // mock tool response
            const resp = { "temperature": 20.5, "traffic": "heavy" };
            toolsTurns.push({ call: tc, response: resp });
        });
        template.pushToHistory({ tools: toolsTurns });
    }
    console.log("\n---------- Next turn template:");
    console.log(template.render());
    console.log("--------------------------------");
    const res2 = await lm.infer(template.prompt(prompt), {
        stream: true,
        temperature: 0.1,
        max_tokens: 4096
    });
    template.pushToHistory({ assistant: res2.text });
    console.log("\n\n---------- Next turn template:");
    console.log(template.render());
    console.log("--------------------------------");
}

(async () => {
    await main();
})();