<template>
  <div>{{ output }}</div>
</template>

<script setup lang="ts">
import { LmBrowserProviderParams } from '../../../packages/browser/src/interfaces';
import { WllamaProvider } from '../../../packages/browser/src/wllama';
import { onMounted, ref } from 'vue';
import { wllamaConf } from "./conf";
import { PromptTemplate } from "modprompt";

const output = ref("");
const lm = WllamaProvider.init({
  onToken: (t) => { output.value += t },
} as LmBrowserProviderParams,
  wllamaConf);
const model = {
  name: "Qween 0.5b",
  url: "https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q5_k_m.gguf",
  ctx: 8192,
}

const onModelLoading = (st) => {
  console.log(st.percent, "%")
}

async function init() {
  await lm.loadModel(model.name, model.ctx, model.url, onModelLoading);
  const p = new PromptTemplate("chatml")
    .replaceSystem("You are an AI assistant. Important: always use json to respond")
    .prompt("List the planets of the solar system.")
  const res = await lm.infer(
    p,
    { temperature: 0, min_p: 0.05 }
  );
  console.log(res.stats)
  await lm.modelsInfo();
  console.log("Available models in cache:", lm.models)
}

onMounted(() => init())
</script>
