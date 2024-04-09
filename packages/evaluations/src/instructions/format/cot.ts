import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../evaluate/src/testcase.js";


const template = new PromptTemplate("alpaca");
const prompt = `What planet or moon of the solar system would be the best for humans to live, out of Earth? \
Let's think step by step. Important: answer briefly using bullet points in this format:

# Observations:
# Thoughts:
# Answer:`;

const evaluator = new Evaluator()
    .containsText(15, "# Observations:")
    .containsText(15, "# Thoughts:")
    .containsText(15, "# Answer:")
    .containsOnlyOne(35, ["# Observations:", "# Thoughts:", "# Answer:"])
    .startsWith(20, "# Observations:")

const inferParams: InferenceParams = {
    temperature: 0,
    max_tokens: 500,
};
const cotFormat = new LmTestCase({
    name: "CoT formating",
    prompt: prompt,
    template: template,
    evaluator: evaluator,
    inferParams: inferParams,
});

export { cotFormat }

