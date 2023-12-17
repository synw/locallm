# LocalLm api

An api to query local language models using different backends. Supported backends:

- [Llama.cpp](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)
- [Koboldcpp](https://github.com/LostRuins/koboldcpp)
- [Ollama](https://github.com/jmorganca/ollama)

:books: [Api doc](https://synw.github.io/locallm/)

## Install

```bash
npm install @locallm/api
```

## Usage

Example with the Koboldcpp provider:

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
  n_predict: 200,
});
```

Check the [examples](examples) directory for more examples
