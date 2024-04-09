import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../evaluate/src/testcase.js";


const template = new PromptTemplate("alpaca");
const prompt = `What planet or moon of the solar system would be the best for humans to live, out of Earth? \
Let's think step by step. Important: answer briefly using this format:

# Observations: (a numbered bullet points list)
# Thoughts: (a numbered bullet points list)
# Answer:`;

const evaluator = new Evaluator(80)
    .containsText(10, "# Observations:")
    .containsText(10, "# Thoughts:")
    .containsText(10, "# Answer:")
    .startsWith(25, "# Observations:")
    .containsOnlyOne(25, ["# Observations:", "# Thoughts:", "# Answer:"])
    .containsText(10, "1.")
    .containsText(10, "2.")

const inferParams: InferenceParams = {
    temperature: 0,
    max_tokens: 800,
};
const cotPoints = new LmTestCase({
    name: "CoT bullet points",
    prompt: prompt,
    template: template,
    evaluator: evaluator,
    inferParams: inferParams,
});

export { cotPoints }

