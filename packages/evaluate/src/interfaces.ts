import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "./evaluate";


type EvalFunction = (text: string) => TestResult;

// { test: { model: { template: [TestResult]}}}
type TestResultsForModels = Record<string, Record<string, Record<string, Array<TestResult>>>>;

interface LmTestParams {
  name: string;
  prompt: string;
  template: PromptTemplate;
  evaluator: Evaluator;
  inferParams?: InferenceParams;
  isVerbose?: boolean;
}

interface EvaluationResult {
  name: string;
  pass: boolean;
  error: string | null;
}

interface TestResult {
  pass: boolean;
  score: number;
  output: string;
  evaluations: Array<EvaluationResult>;
  error?: string;
}

/**
 * Represents the configuration of a model.
 *
 * @interface ModelConf
 * @property {string} name - The name of the model.
 * @property {number} ctx - The context window length.
 * @property {string} template - The name of the template to use with the model.
 */
interface SafeModelConf {
  name: string,
  ctx: number,
  template: string,
}

type EvaluationFunction = (name: string, response: string, param: any, error: string | null) => EvaluationResult;

export { LmTestParams, EvalFunction, TestResult, TestResultsForModels, EvaluationResult, EvaluationFunction, SafeModelConf }