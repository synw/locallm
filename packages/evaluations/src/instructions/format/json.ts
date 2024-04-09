import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../evaluate/src/testcase.js";


const template = new PromptTemplate("alpaca");
const prompt = `List the planets names of the solar system. Important: output only a json code block, nothing else.`;

const evaluator = new Evaluator()
  .isOnlyCodeBlock(50)
  .containsValidJson(50)

const inferParams: InferenceParams = {
  temperature: 0,
  max_tokens: 500,
};
const jsonFormat = new LmTestCase({
  name: "Json code block",
  prompt: prompt,
  template: template,
  evaluator: evaluator,
  inferParams: inferParams,
});

export { jsonFormat }

