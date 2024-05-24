import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../../packages/evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../../packages/evaluate/src/testcase.js";


const template = new PromptTemplate("alpaca")
  .afterSystem("You are a javascript AI assistant")
  .replacePrompt("fix this invalid json:\n\n```json\n{prompt}\n```\n\nOutput only a code block, nothing else")
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
  .isOnlyCodeBlock(30)
  .containsValidJson(30)
  .containsText(40, [
    '"Date": "2019-08-01T00:00:00-07:00",',
    '"TemperatureCelsius": 25,',
    '"Summary": "hello"',
  ])

const inferParams: InferenceParams = {
  temperature: 0,
  max_tokens: 250,
};
const fixJsonTest = new LmTestCase({
  name: "fix json",
  prompt: prompt,
  template: template,
  evaluator: evaluator,
  inferParams: inferParams,
});

export { fixJsonTest }

