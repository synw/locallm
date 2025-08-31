# LocalLm api

An api to query local language models using different backends. Supported backends:

- [Llama.cpp](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)
- [Koboldcpp](https://github.com/LostRuins/koboldcpp)
- [Ollama](https://github.com/jmorganca/ollama)
- Any Openai compatible endpoint

:books: [Api doc](https://synw.github.io/locallm/)

## Install

```bash
npm install @locallm/api
```

## Usage

Example with the Koboldcpp provider, manual template:

```ts
import { Lm } from "@locallm/api";

const lm = new Lm({
  providerType: "koboldcpp",
  serverUrl: "http://localhost:5001",
  onToken: (t) => process.stdout.write(t),
});
const template = "<s>[INST] {prompt} [/INST]";
const _prompt = template.replace("{prompt}", "list the planets in the solar system");
// run the inference query
await lm.infer(_prompt, {
  stream: true,
  temperature: 0.2,
});
```

Example with the Llama.cpp provider, openai compatible endpoint, server side template:

```ts
import { Lm } from "@locallm/api";

const lm = new Lm({
    providerType: "openai",
    serverUrl: "http://localhost:8080/v1",
    onToken: (t) => process.stdout.write(t),
});
process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
});
const _prompt = "list the planets in the solar system";
const res = await lm.infer(_prompt, {
    stream: true,
    temperature: 0.5,
});
```

Check the [examples](examples) directory for more examples
