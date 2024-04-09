import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "./evaluate";


type EvalFunction = (text: string) => TestResult;

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

interface FinalEvaluationResult extends EvaluationResult {
  points: number;
}

interface TestResult {
  name: string;
  pass: boolean;
  score: number;
  thresold: number;
  output: string;
  prompt: string;
  evaluations: Array<FinalEvaluationResult>;
  inferParams: InferenceParams;
  stats: Record<string, any>;
}

type EvaluationFunction = (name: string, response: string, param: any, error: string | null) => EvaluationResult;

export { LmTestParams, EvalFunction, TestResult, TestResults, FinalEvaluationResult, EvaluationResult, EvaluationFunction }