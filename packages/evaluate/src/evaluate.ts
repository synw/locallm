import { EvaluationFunction, EvaluationResult, TestResult } from "./interfaces.js";
import { containsCodeBlock } from "./evaluators/code/main.js";
import { containsValidJavascript, containsValidJson } from "./evaluators/code/js/main.js";
import { containsText } from "./evaluators/text/containsText.js";

class Evaluator {
  thresold = 100;
  evalFuncs = new Array<{ name: string, param: any, passScore: number, error: string | null, func: EvaluationFunction }>();

  constructor(thresold = 100) {
    this.thresold = thresold;
  }

  run(response: string): TestResult {
    const results: TestResult = {
      pass: false,
      score: 0,
      output: response,
      evaluations: new Array<EvaluationResult>(),
    };
    this.evalFuncs.forEach((fp) => {
      const res = fp.func(response, fp.name, fp.param, fp.error);
      if (res.pass) {
        results.score += fp.passScore;
      }
      results.evaluations.push(res);
    });
    if (results.score >= this.thresold) {
      results.pass = true;
    }
    return results
  }

  add(name: string, passScore: number, param: string | null = null, evalFunc: EvaluationFunction, error: string | null = null): Evaluator {
    this._stackEvalFunc(name, passScore, evalFunc, param, error);
    return this
  }

  containsText(passScore: number, param: string | Array<string>, error: string | null = null): Evaluator {
    this._stackEvalFunc("Contains text", passScore, containsText, param, error);
    return this
  }

  containsCode(passScore: number, param: string | null = null, error: string | null = null): Evaluator {
    this._stackEvalFunc("Contains code", passScore, containsCodeBlock, param, error);
    return this
  }

  containsValidJson(passScore: number, param: string | null = null, error: string | null = null): Evaluator {
    this._stackEvalFunc("Contains valid json", passScore, containsValidJson, param, error);
    return this
  }

  containsValidJavascript(passScore: number, param: string | null = null, error: string | null = null): Evaluator {
    this._stackEvalFunc("Contains valid javascript", passScore, containsValidJavascript, param, error);
    return this
  }

  private _stackEvalFunc(name: string, passScore: number, evalFunc: EvaluationFunction, param: any = null, error: string | null = null) {
    this.evalFuncs.push({
      name: name,
      param: param,
      passScore: passScore,
      error: error,
      func: evalFunc,
    });
  }
}

export { Evaluator }