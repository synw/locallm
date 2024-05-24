import { Lm } from "@locallm/api";
//import { Lm } from "./packages/locallm/api.js";
import { TestResult, TestResults } from "./interfaces.js";
import { LmTestCase } from "./testcase.js";
import { InferenceParams, ModelConf } from "@locallm/types";


class LmTestRunner {
  lm: Lm;
  modelConf: ModelConf = {
    name: "No model",
    ctx: 2048,
  };
  testCases = new Array<LmTestCase>();
  isVerbose = true;
  showErrors = true;
  // runtime state
  results: TestResults = {};

  constructor(lm: Lm, isVerbose?: boolean, showErrors?: boolean) {
    this.lm = lm;
    this.isVerbose = isVerbose ?? true;
    this.showErrors = showErrors ?? true;
  }

  static async init(lm: Lm, testCases: Array<LmTestCase>, isVerbose?: boolean, showErrors?: boolean): Promise<LmTestRunner> {
    const runner = new LmTestRunner(lm, isVerbose, showErrors);
    //await runner.lm.loadModel("");
    let ctx = runner.lm.model.ctx ?? 2048;
    if (runner.lm.model.ctx === undefined) {
      console.warn(`The model conf ${runner.lm.model.name} does not have a ctx value, using 2048`)
    }
    runner.modelConf = {
      name: runner.lm.model.name,
      ctx: ctx,
    };
    //console.log("Available models:", runner.modelsConf);
    runner.testCases = [...testCases];
    return runner
  }

  async run(templateName?: string, inferenceParams?: InferenceParams, onRunTestcase: () => void = () => null) {
    this.results = {};
    if (this.isVerbose) {
      console.log("----------------------------------");
      console.log("🎬", this.modelConf.name, "...");
      console.log("----------------------------------");
    }
    await this.runTestCases(templateName, inferenceParams, onRunTestcase);
  }

  printTestResult(testname: string, result: TestResult, _showErrors = true) {
    if (this.isVerbose) {
      //console.log(result);
      if (!result.pass) {
        console.log('❌', (testname), "failed");
        if (_showErrors && this.showErrors) {
          const errs = new Array<string>();
          result.evaluations.forEach((ev) => {
            if (ev.error) {
              errs.push(ev.error)
            }
          })
          if (errs.length > 1) {
            console.log("\t", "📫", "Errors:");
            errs.forEach((err) => {
              console.log("\t  -", err)
            });
          } else {
            console.log("\t", "📫", errs[0] + ":");
          }
          //const out = result.output;
          //console.log(out.replace(/^/gm, '\t'));
        }
      } else {
        console.log("✅", testname, "passed")
      }
    }
  }

  printReport() {
    //console.log(JSON.stringify(this.results, null, "  "));
    for (const [testname, runs] of Object.entries(this.results)) {
      console.log(`------- ${testname} -------`);
      //console.log(`- ${modelname}:`);
      let i = 0;
      for (const run of runs) {
        this.printTestResult(`${this.lm.model.name} run ${i}`, run, false);
        ++i
      }
    }
  }

  async runTestCases(templateName?: string, inferenceParams?: InferenceParams, onRunTestcase: () => void = () => null) {
    let n = 0;
    for (const testCase of this.testCases) {
      onRunTestcase();
      let res: TestResult;
      //console.log("RUN", testCase, m, templateName)
      res = await testCase.run(this.lm, templateName, inferenceParams);

      // update results
      if (!(testCase.name in this.results)) {
        this.results[testCase.name] = []
      }
      this.results[testCase.name].push(res);
      // print
      //console.log(JSON.stringify(this.results, null, "  "));
      if (this.isVerbose) {
        this.printTestResult(testCase.name, res)
      }
      ++n
    }
  }
}

export { LmTestRunner }