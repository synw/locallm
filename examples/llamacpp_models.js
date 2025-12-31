#!/usr/bin/env node
import { Lm } from "../packages/api/dist/main.js";

const models = ["qwen1.7b", "qwen4b"];

async function main ()
{
  const lm = new Lm({
    providerType: "llamacpp",
    serverUrl: "http://localhost:8080",
    onToken: (t) => process.stdout.write(t),
  });
  const res = await lm.modelsInfo();
  console.log(res.forEach(m => console.log(m.name, m.extra.status.value)));
  // load model
  await lm.loadModel(models[0]);
  console.log(res.filter(m => models.includes(m.name)).forEach(m => console.dir(m, { depth: 5 })));
  console.log("--------- Loaded model info -------------");
  const mi = await lm.modelInfo();
  console.dir(mi, { depth: 5 });
}

(async () => await main())();