#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

const models = ["qwen1.7b", "qwen4b"];

async function main()
{
  const lm = new Lm({
    providerType: "llamacpp",
    serverUrl: "http://localhost:8080",
    onToken: (t) => process.stdout.write(t),
  });
  const res = await lm.modelsInfo();
  console.log(res.forEach(m => console.log(m.name, m.extra.in_cache)));
  // load model
  await lm.loadModel(models[0]);
  console.log(res.filter(m => models.includes(m.name)).forEach(m => console.log(m)));
}

(async () =>
{
  await main();
})();