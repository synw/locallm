#!/usr/bin/env node

import { argv } from "process";
import { readFileSync } from 'fs';
import { join } from 'path';

import { Lm } from "@locallm/api";
import { LmTestRunner, LmTestCase } from "../../../evaluate/src/main.js";
import { InferenceParams } from "@locallm/types";


const defaultLm = new Lm({
  providerType: "goinfer",
  serverUrl: 'http://localhost:5143',
  apiKey: "7aea109636aefb984b13f9b6927cd174425a1e05ab5f2e3935ddfeb183099465",
  onToken: (t: string) => {
    //console.log("Token", t)
  },
});
const inferParams: InferenceParams = {
  temperature: 0,
  top_p: 0.35,
  n_predict: 512,
  threads: 3,
};

async function main(
  testCases: Array<LmTestCase>,
  models: Array<string>,
  lm: Lm = defaultLm
) {
  const testRunner = await LmTestRunner.init(lm, testCases, true);
  await testRunner.run(models, inferParams);
  console.log("Test results:");
  testRunner.printReport();
}

function readModels(path: string): Array<string> {
  const contents = readFileSync(join(path), 'utf-8').trim();
  const lines = contents.split(/\r?\n/);
  const models = new Array<string>;
  lines.forEach((l) => {
    if (!l.startsWith("#")) {
      models.push(l)
    }
  })
  return models
}

(async () => {
  let models = new Array<string>();
  let testCases = new Array<LmTestCase>;
  let testRunName = "";
  let i = 0;
  for (const arg of argv.slice(2, argv.length)) {
    if (i == 0) {
      testRunName = arg;
      try {
        console.log("Importing tests", testRunName);
        const { tests } = await import("../" + testRunName + "/index.ts");
        testCases = tests as Array<LmTestCase>;
      } catch (e) {
        throw new Error(`Error ${e}`)
      }
    } else if (i == 1) {
      if (arg.startsWith("-m")) {
        models = [arg.replace("-m=", "")]
      } else {
        const modelsPath = arg;
        models = readModels(modelsPath);
      }
    }
    ++i
  }
  console.log("Running evaluation", testRunName, "with models", JSON.stringify(models));
  await main(testCases, models);
})();