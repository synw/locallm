import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../../packages/evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../../packages/evaluate/src/main.js";


const template = new PromptTemplate("alpaca")
  .afterSystem("You are a Typescript code expert")
  .replacePrompt("I have the following Typescript code:\n\n```ts\n{prompt}\n```\n\nOptimize it for performance");
const prompt = `function sum(numbers: number[]): number {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}`;

const evaluator = new Evaluator()
  .containsCode(50)
  .containsText(50, ".reduce", "The output does not match the expected use of reduce")


const inferParams: InferenceParams = {
  temperature: 0,
  max_tokens: 150,
};
const optimizeTsTest = new LmTestCase({
  name: "optimize Typescript",
  prompt: prompt,
  template: template,
  evaluator: evaluator,
  inferParams: inferParams,
});

export { optimizeTsTest }

