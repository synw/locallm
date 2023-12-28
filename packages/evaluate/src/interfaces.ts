import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "./evaluate";


type EvalFunction = (text: string) => TestResult;

// { test: { template: [TestResult]}}
//type TestResultsForModels = Record<string, Record<string, Array<TestResult>>>;
type TestResults = Record<string, Array<TestResult>>;

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

type EvaluationFunction = (name: string, response: string, param: any, error: string | null) => EvaluationResult;

export { LmTestParams, EvalFunction, TestResult, TestResults, EvaluationResult, EvaluationFunction }