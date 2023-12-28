import { PromptTemplate } from "modprompt";
import { InferenceParams, ModelConf } from "@locallm/types";
//import { Lm } from "@locallm/api";
import { Lm } from "./packages/locallm/api.js";
import { LmTestParams, TestResult } from "./interfaces.js";
import { Evaluator } from "./evaluate.js";

class LmTestCase {
  name: string;
  prompt: string;
  template: PromptTemplate;
  inferParams: InferenceParams;
  evaluator: Evaluator;
  isVerbose = true;
  model: ModelConf = { name: "", ctx: 2048 };
  // state
  _modelName: string | null = null;
  _ctx: number = 2048;

  constructor(params: LmTestParams) {
    this.name = params.name;
    this.prompt = params.prompt;
    this.template = params.template;
    this.evaluator = params.evaluator;
    this.inferParams = params.inferParams ?? {};
    this.isVerbose = params.isVerbose ?? true;
  }

  /*setTemplate(name: string): LmTestCase {
    //console.log("Set template", name);
    this._templateName = name;
    this.template = this.template.cloneTo(this._templateName);
    // set stop words
    if (this.template.stop) {
      if (this.inferParams.stop) {
        this.inferParams.stop.concat(this.template.stop)
      } else {
        this.inferParams.stop = [...this.template.stop]
      }
      this.inferParams.stop.push(this.template.user)
    }
    //console.log("STOP", this.inferParams.stop)
    return this
  }*/

  /*setModel(modelConf: ModelConf): LmTestCase {
    //console.log("Set model", modelConf.name, modelConf.ctx);
    this._modelName = modelConf.name;
    this._ctx = modelConf.ctx;
    return this
  }*/

  async run(lm: Lm, templateName?: string, overrideInferenceParams?: InferenceParams): Promise<TestResult> {
    if (lm.model.name.length == 0) {
      await lm.loadModel("");
    }
    // call api
    let inferParams: InferenceParams;
    if (overrideInferenceParams) {
      //console.log("Override params", overrideInferenceParams)
      const _tmp = overrideInferenceParams as Record<string, any>;
      const _newp = this.inferParams as Record<string, any>;
      for (const [k, v] of Object.entries(_tmp)) {
        _newp[k] = v
      }
      inferParams = _newp as InferenceParams;
    } else {
      //console.log("Test params")
      inferParams = this.inferParams;
    }
    if (this._modelName) {
      inferParams.model = {
        name: this._modelName,
        ctx: this._ctx,
      }
    }
    let tpl = this.template;
    if (templateName) {
      tpl = this.template.cloneTo(templateName)
    }
    //console.log("PARAMS", inferParams)
    //console.log("Running inference with prompt:");
    //console.log(this.template.render());
    const res = await lm.infer(tpl.prompt(this.prompt), inferParams);
    const result = this.evaluator.run(res.text);
    //console.log(result);
    return result
  }
}

export { LmTestCase }