# LocalLm

An api to query local language models using different backends

| Version | Name | Description | Doc
| --- | --- | --- | --- |
| [![pub package](https://img.shields.io/npm/v/@locallm/types)](https://www.npmjs.com/package/@locallm/types) | [@locallm/types](packages/types) | The shared data types | [Api doc](https://synw.github.io/locallm/types/index.html) - [Readme](packages/types)
| [![pub package](https://img.shields.io/npm/v/@locallm/api)](https://www.npmjs.com/package/@locallm/api) | [@locallm/api](packages/api) | Run local language models using different backends |  [Api doc](https://synw.github.io/locallm/api/index.html) - [Readme](packages/api)
| [![pub package](https://img.shields.io/npm/v/@locallm/browser)](https://www.npmjs.com/package/@locallm/browser) | [@locallm/browser](packages/browser) | Run quantitized language models inside the browser |  [Api doc](https://synw.github.io/locallm/browser/index.html) - [Readme](packages/browser)

### Supported backends

- [Llama.cpp](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)
- [Koboldcpp](https://github.com/LostRuins/koboldcpp)
- [Ollama](https://github.com/jmorganca/ollama)
- [Wllama](https://github.com/ngxson/wllama) (for in browser inference)

## Quickstart

### Api

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

## In browser inference

Example of in browser inference with Qween 2 0.5b:

```html
<div id="output"></div>
<script src="https://unpkg.com/modprompt@0.7.7/dist/mod.min.js"></script>
<script src="https://unpkg.com/@locallm/browser@0.0.5/dist/main.min.js"></script>
<script>
    const out = document.getElementById('output');
    const lm = $lm.WllamaProvider.init({
        onToken: (t) => { out.innerText = t },
        onStartEmit: () => {

        }
    });
    const model = {
        name: "Qween 0.5b",
        url: "https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q5_k_m.gguf",
        ctx: 32768,
    }

    const onModelLoading = (st) => {
        const msg = "Model downloading: " + st.percent + " %";
        console.log(msg);
        out.innerText = msg;
        if (st.percent == 100) {
            out.innerText = "Loading model into memory ..."
        }
    }

    lm.loadBrowsermodel(model.name, model.url, model.ctx, onModelLoading).then(() => {
        out.innerText = "Ingesting prompt ...";
        const p = new $tpl.PromptTemplate("chatml")
            .replaceSystem("You are an AI assistant")
            .prompt("List the orbital periods of the planets of the solar system.")
        lm.infer(
            p,
            { temperature: 0, min_p: 0.05 }
        ).then((res) => {
            console.log("Stats", res.stats)
        });
    });
</script>
```

## Examples

Check the [examples](packages/api/examples) directory for more examples