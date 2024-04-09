import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../evaluate/src/testcase.js";


const template = new PromptTemplate("alpaca");
const prompt = `Do the monkeys have wings? Important: only answer with this exact format and nothing else: "yes" or "no"`;

const evaluator = new Evaluator()
  .startsWith(30, ["yes", "no"])
  //.containsText(20, ["yes", "no", "Yes", "No"])
  .isText(60, ["yes", "no"])
  .maxLength(10, 4)

const inferParams: InferenceParams = {
  temperature: 0,
  max_tokens: 50,
};
const simpleFormat = new LmTestCase({
  name: "Simple formating",
  prompt: prompt,
  template: template,
  evaluator: evaluator,
  inferParams: inferParams,
});

export { simpleFormat }

