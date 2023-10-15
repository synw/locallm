# LocalLm

An api to query local language models using different backends

| Version | Name | Description | Doc
| --- | --- | --- | --- |
| [![pub package](https://img.shields.io/npm/v/@locallm/types)](https://www.npmjs.com/package/@locallm/types) | [@locallm/types](packages/types) | The shared data types | [Api doc](https://synw.github.io/locallm/types/index.html) - [Readme](packages/types)
| [![pub package](https://img.shields.io/npm/v/@locallm/api)](https://www.npmjs.com/package/@locallm/api) | [@locallm/api](packages/api) | The javascript api to run local language models using different backends |  [Api doc](https://synw.github.io/locallm/api/index.html) - [Readme](packages/api)

### Supported backends

- [Koboldcpp](https://github.com/LostRuins/koboldcpp)
- [Ollama](https://github.com/jmorganca/ollama)
- [Goinfer](https://github.com/synw/goinfer)

## Quickstart

```bash
npm install @locallm/api
# or
yarn add @locallm/api
```

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

Check the [examples](packages/api/examples) directory for more examples