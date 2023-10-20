# LocalLm api

An api to query local language models using different backends. Supported backends:

- [Koboldcpp](https://github.com/LostRuins/koboldcpp)
- [Ollama](https://github.com/jmorganca/ollama)
- [Goinfer](https://github.com/synw/goinfer)

:books: [Api doc](https://synw.github.io/locallm/)

## Install

```bash
npm install @locallm/api
# or
yarn add @locallm/api
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
const res = await lm.infer(_prompt, {
  temperature: 0,
  top_p: 0.35,
  n_predict: 200,
});
console.log(res);
```

Check the [examples](examples) directory for more examples
