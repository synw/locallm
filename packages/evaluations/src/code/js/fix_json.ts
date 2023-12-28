import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../../packages/evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../../packages/evaluate/src/main.js";


const template = new PromptTemplate("alpaca")
  .afterSystem("You are a javascript expert")
  .replacePrompt("fix this invalid json and respond with valid json only:\n\n```json\n{prompt}\n```")
  .addShot(
    `{"a":2, "b": text 585,} // a comment`,
    `\n\n\`\`\`json
    {"a": 2, "b": "text 585"}
    \`\`\``,
  );
const prompt = `{
  "Date": 2019-08-01T00:00:00-07:00,
  "TemperatureCelsius": 25, // Fahrenheit 77
  "Summary": "hello", /* a comment */
  // Comments on
  /* separate lines */
}`;

const evaluator = new Evaluator()
  .containsValidJson(50)
  .containsText(50, [
    '"Date": "2019-08-01T00:00:00-07:00",',
    '"TemperatureCelsius": 25,',
    '"Summary": "hello"',
  ])

const inferParams: InferenceParams = {
  temperature: 0,
  max_tokens: 120,
};
const fixJsonTest = new LmTestCase({
  name: "fix json",
  prompt: prompt,
  template: template,
  evaluator: evaluator,
  inferParams: inferParams,
});

export { fixJsonTest }

