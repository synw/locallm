#!/usr/bin/env node

import { argv } from "process";
//import { Lm } from "@locallm/api";
import { Lm } from "../packages/locallm/api.js";
import { LmTestRunner, LmTestCase } from "../../../evaluate/src/main.js";
import { loadTestCases } from "../load_test.js";


const defaultLm = new Lm({
  providerType: "koboldcpp",
  serverUrl: 'http://localhost:5001',
  onToken: (t: string) => {
    //console.log("Token", t)
  },
});

async function main(
  testCases: Array<LmTestCase>,
  templateName: string,
  lm: Lm = defaultLm,
) {
  const testRunner = await LmTestRunner.init(lm, testCases, true);
  await testRunner.run(templateName);
  console.log("Test results:");
  testRunner.printReport();
}

(async () => {
  let testCases = new Array<LmTestCase>;
  let testRunName = "";
  let i = 0;
  let templateName = "";
  for (const arg of argv.slice(2, argv.length)) {
    if (i == 0) {
      testRunName = arg;
      try {
        console.log("Importing tests", testRunName);
        testCases = await loadTestCases(testRunName);
      } catch (e) {
        throw new Error(`Error ${e}`)
      }
    } else {
      templateName = arg;
    }
    ++i
  }
  if (templateName == "") {
    throw new Error("Provide a template name as second argument")
  }
  console.log("Running evaluation", testRunName, "with template", templateName);
  await main(testCases, templateName);
})();