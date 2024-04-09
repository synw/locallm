import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../../packages/evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../../packages/evaluate/src/testcase.js";

const baseprompt = `in Python create a detailed and helpful Google style docstring for this code:

\`\`\`python
{prompt}
\`\`\`

Important: always provide a short example in the docstring. Break lines at 86 characters maximum. Output only the docstring`;

const shotUser = `def add(a: float, b: float = 2.5) -> float:
  if a < 0:
      raise ValueError("Provide a positive number for a")
  try:
      return a + b
  except Exception as e:
      raise (e)`;
const shotAssistant = `\`\`\`python
"""
Sums two float numbers, but ensures the first number is non-negative. If the
second number is not provided, it defaults to 2.5.

Args:
    a (float): The first number to be added. Must be a non-negative float.
    b (float, optional): The second number to be added. Defaults to 2.5. Can be
        any float.

Returns:
    float: The sum of a and b.

Raises:
    ValueError: If \`a\` is negative.
    Exception: Any unexpected error that might occur during addition.

Example:
    >>> add(2.5)
    5.0
    >>> add(2.5, 3.5)
    6.0
    >>> add(-1.0)
    ValueError: Provide a positive number for a
"""
\`\`\``;

const template = new PromptTemplate("alpaca")
    .replacePrompt(baseprompt)
    .addShot(shotUser, shotAssistant);
const prompt = `def throw_dice(dice_sides: List[int], num_throws=1) -> List[int]:
    try:
        return random.choices(dice_sides, k=num_throws)"
    except Exception as e:
        raise(f"Wrong value provided: {e}")
    except ValueError as e:
        raise(f"Error running throw dice: {e}")`;

const evaluator = new Evaluator()
    .containsText(50, ['Args:', 'Raises:', 'Returns:', 'Example:'])
    .containsText(50, ['Exception:', 'ValueError:', 'dice_sides (List[int])', 'num_throws (int, optional)', 'List[int]'])

const inferParams: InferenceParams = {
    temperature: 0,
    max_tokens: 512,
};
const createDocstringTest = new LmTestCase({
    name: "create_docstring",
    prompt: prompt,
    template: template,
    evaluator: evaluator,
    inferParams: inferParams,
});

export { createDocstringTest }

