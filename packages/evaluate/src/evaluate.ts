import { InferenceParams } from "@locallm/types";
import { EvaluationFunction, EvaluationResult, FinalEvaluationResult, TestResult } from "./interfaces.js";
import { containsCodeBlock, isOnlyCodeBlock } from "./evaluators/code/main.js";
import { containsValidJavascript, containsValidJson } from "./evaluators/code/js/main.js";
import { containsText } from "./evaluators/text/containsText.js";
import { isText } from "./evaluators/text/isText.js";
import { startsWith } from "./evaluators/text/startsWith.js";
import { maxLength } from "./evaluators/text/maxLength.js";
import { containsOnlyOne } from "./evaluators/text/containsOnlyOne.js";

class Evaluator {
  thresold = 100;
  evalFuncs = new Array<{ name: string, param: any, passScore: number, error: string | null, func: EvaluationFunction }>();

  constructor(thresold = 100) {
    this.thresold = thresold;
  }

  run(name: string, prompt: string, response: string, inferParams: InferenceParams, stats: Record<string, any>): TestResult {
    const results: TestResult = {
      name: name,
      pass: false,
      score: 0,
      thresold: this.thresold,
      prompt: prompt,
      output: response,
      evaluations: new Array<FinalEvaluationResult>(),
      inferParams: inferParams,
      stats: stats,
    };
    this.evalFuncs.forEach((fp) => {
      const res = fp.func(response, fp.name, fp.param, fp.error);
      if (res.pass) {
        results.score += fp.passScore;
      }
      results.evaluations.push({
        ...res,
        points: fp.passScore,
      });
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

  isText(passScore: number, param: string | Array<string>, error: string | null = null): Evaluator {
    this._stackEvalFunc(`Is text: ${param}`, passScore, isText, param, error);
    return this
  }

  containsText(passScore: number, param: string | Array<string>, error: string | null = null): Evaluator {
    this._stackEvalFunc(`Contains text ${param}`, passScore, containsText, param, error);
    return this
  }

  containsOnlyOne(passScore: number, param: string | Array<string>, error: string | null = null): Evaluator {
    this._stackEvalFunc(`Contains only one occurence of ${param}`, passScore, containsOnlyOne, param, error);
    return this
  }

  startsWith(passScore: number, param: string | Array<string>, error: string | null = null): Evaluator {
    this._stackEvalFunc(`Starts with ${param}`, passScore, startsWith, param, error);
    return this
  }

  maxLength(passScore: number, param: number, error: string | null = null): Evaluator {
    this._stackEvalFunc(`Max length ${param}`, passScore, maxLength, param, error);
    return this
  }

  isOnlyCodeBlock(passScore: number, param: string | null = null, error: string | null = null): Evaluator {
    this._stackEvalFunc("Is only a code block", passScore, isOnlyCodeBlock, param, error);
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