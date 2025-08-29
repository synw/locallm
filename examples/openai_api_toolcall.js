#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

let model;
let apiKey = "";
const serverUrl = "http://localhost:8080/v1" // llamacpp openai endpoint
//const serverUrl = "http://localhost:5001/v1" // koboldcpp openai endpoint
//const serverUrl = "http://localhost:11434/v1" // ollama openai endpoint
//model = "granite3.3:2b";
//const serverUrl = "https://openrouter.ai/api/v1";
//model = "qwen/qwen3-4b:free";
//apiKey = process.env.OPENROUTER_API_KEY;
const system = "You are a helpful touristic assistant";
const _prompt = `I am landing in Barcelona soon: I plan to reach my hotel and then go for outdoor sport. 
How are the conditions in the city?`;
//const _prompt = "What is the current weather in Barcelona?"

function run_get_current_weather(args) {
    console.log("Running the get_current_weather tool with args", args);
    return '{ "temp": 20.5, "weather": "rain" }'
}

function run_get_current_traffic(args) {
    console.log("Running the get_current_traffic tool with args", args);
    return '{ "trafic": "normal" }'
}

const get_current_weather = {
    "name": "get_current_weather",
    "description": "Get the current weather",
    "arguments": {
        "location": {
            "description": "The city and state, e.g. San Francisco, CA",
            "required": true
        }
    },
    execute: run_get_current_weather
};

const get_current_traffic = {
    "name": "get_current_traffic",
    "description": "Get the current road traffic conditions",
    "arguments": {
        "location": {
            "description": "The city and state, e.g. San Francisco, CA",
            "required": true
        }
    },
    execute: run_get_current_traffic
};

const tools = {
    "get_current_weather": get_current_weather,
    "get_current_traffic": get_current_traffic,
}

async function main() {
    const lm = new Lm({
        providerType: "openai",
        serverUrl: serverUrl,
        apiKey: apiKey,
        onToken: (t) => process.stdout.write(t),
    });
    process.on('SIGINT', () => {
        lm.abort().then(() => process.exit());
    });
    const res = await lm.infer(_prompt, {
        temperature: 0.5,
        top_k: 40,
        top_p: 0.95,
        min_p: 0,
        max_tokens: 4096,
        extra: {
            system: system,
            model: model ?? "",
            tools: [get_current_weather, get_current_traffic]
        }
    });
    console.log(JSON.stringify(res, null, 2));
    const history = [{ user: _prompt }];
    const toolsResults = [];
    if (res?.toolCalls) {
        for (const toolCall of res.toolCalls) {
            console.log("Tool call", JSON.stringify(toolCall, null, 2));
            const tr = tools[toolCall.name].execute(toolCall.arguments);
            console.log("tool result:", tr);
            toolsResults.push({ id: toolCall.id, content: tr });
        }
        history.push({ tools: { results: toolsResults, calls: res.toolCalls } })
    } else {
        history.push({ assistant: res.text })
    }
    console.log("History:\n", JSON.stringify(history, null, 2));
    const res2 = await lm.infer(" ", {
        temperature: 0.5,
        top_k: 40,
        top_p: 0.95,
        min_p: 0,
        max_tokens: 4096,
        extra: {
            system: system,
            model: model ?? "",
            tools: [get_current_weather, get_current_traffic],
            history: history,
        }
    });
    console.log()
    console.log("FINAL", JSON.stringify(res2, null, 2));
}

(async () => {
    await main();
})();