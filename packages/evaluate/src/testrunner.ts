import { Lm } from "@locallm/api";
import { SafeModelConf, TestResult, TestResultsForModels } from "./interfaces.js";
import { LmTestCase } from "./testcase.js";
import { InferenceParams } from "@locallm/types";


class LmTestRunner {
  lm: Lm;
  modelsConf: Array<SafeModelConf> = [];
  testCases = new Array<LmTestCase>();
  isVerbose = true;
  showErrors = true;
  // runtime state
  results: TestResultsForModels = {};

  constructor(lm: Lm, isVerbose?: boolean, showErrors?: boolean) {
    this.lm = lm;
    this.isVerbose = isVerbose ?? true;
    this.showErrors = showErrors ?? true;
  }

  static async init(lm: Lm, testCases: Array<LmTestCase>, isVerbose?: boolean, showErrors?: boolean): Promise<LmTestRunner> {
    const runner = new LmTestRunner(lm, isVerbose, showErrors);
    await runner.lm.modelsInfo();
    //console.log("MODELS", runner.lm.models)
    runner.lm.models.forEach((mc) => {
      let ctx = mc.ctx ?? 2048;
      let template = mc.template ?? "none";
      if (mc.ctx === undefined) {
        console.warn(`The model conf ${mc.name} does not have a ctx value, using 2048`)
      }
      if (mc.template === undefined) {
        console.warn(`The model conf ${mc.name} does not have a template value, using "none"`)
      }
      runner.modelsConf.push({
        name: mc.name,
        ctx: ctx,
        template: template,
      })
    });
    //console.log("Available models:", runner.modelsConf);
    runner.testCases = [...testCases];
    return runner
  }

  async run(models?: Array<string>, inferenceParams?: InferenceParams, extraTemplateRuns: Record<string, Array<string>> = {}) {
    const modelNames = this.modelsConf.map(item => item.name);
    const _models = models ?? modelNames;
    this.results = {};
    for (const model of _models) {
      const modelConf = this._getModelFromConf(model);
      if (this.isVerbose) {
        console.log("----------------------------------");
        console.log("🎬", model, "...");
        console.log("----------------------------------");
      }
      if (!modelNames.includes(model)) {
        throw new Error(`No template and context info found for model ${model}`)
      }
      await this.runTestCases(model, modelConf.template, inferenceParams);
      if (model in extraTemplateRuns) {
        const modelTemplatesNames = extraTemplateRuns[model];
        for (const modelTemplateName of modelTemplatesNames) {
          if (this.isVerbose) {
            console.log("----------------------------------");
            console.log(`➕ Extra run with template ${modelTemplateName}:`)
          }
          await this.runTestCases(model, modelTemplateName, inferenceParams);
        }
      }
    }
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
    for (const [testname, modelRuns] of Object.entries(this.results)) {
      console.log(`------- ${testname} -------`);
      for (const [modelname, templateRuns] of Object.entries(modelRuns)) {
        //console.log(`- ${modelname}:`);
        for (const [templatename, runs] of Object.entries(templateRuns)) {
          if (runs.length == 1) {
            this.printTestResult(`${modelname} (${templatename})`, runs[0], false)
          } else {
            let i = 1;
            runs.forEach((run) => {
              this.printTestResult(`${modelname} run ${i} (${templatename})`, run, false)
              ++i
            })
          }
        }
      }
    }
  }

  async runTestCases(model: string, templateName: string, inferenceParams?: InferenceParams) {
    let n = 0;
    for (const testCase of this.testCases) {
      let res: TestResult;
      if (n == 0) {
        const m = this._getModelFromConf(model);
        //console.log("RUN", testCase, m, templateName)
        res = await this.runTestCase(testCase, m, templateName, inferenceParams);
      } else {
        res = await this.runTestCase(testCase, undefined, templateName, inferenceParams);
      }
      // update results
      if (!(testCase.name in this.results)) {
        this.results[testCase.name] = {}
      }
      if (!(model in this.results[testCase.name])) {
        this.results[testCase.name][model] = {}
      }
      if (!(templateName in this.results[testCase.name][model])) {
        this.results[testCase.name][model][templateName] = [];
      }
      this.results[testCase.name][model][templateName].push(res);
      // print
      //console.log(JSON.stringify(this.results, null, "  "));
      if (this.isVerbose) {
        this.printTestResult(testCase.name, res)
      }
      ++n
    }
  }

  async runTestCase(testCase: LmTestCase, modelConf?: SafeModelConf, templateName?: string, inferenceParams?: InferenceParams): Promise<TestResult> {
    //console.log("RUNTC", modelConf, modelName)
    if (modelConf) {
      testCase.setModel(modelConf);
    }
    if (templateName) {
      testCase.setTemplate(templateName)
    }
    return await testCase.run(this.lm, inferenceParams);
  }

  _getModelFromConf(name: string): SafeModelConf {
    const modelConf = this.modelsConf.find(item => item.name == name);
    if (!modelConf) {
      throw new Error(`No model conf found for model ${name}`)
    }
    return modelConf
  }
}

export { LmTestRunner }