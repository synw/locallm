import { EvaluationResult } from "../../interfaces.js";
import { extractCodeBetweenTags } from "../../utils.js";

function containsCodeBlock(response: string, name: string, param: any, error: string | null = null): EvaluationResult {
  const res: EvaluationResult = {
    name: name,
    pass: false,
    error: null,
  };
  if (response.includes("```")) {
    const code = extractCodeBetweenTags(response);
    if (!code) {
      if (error) {
        res.error = error
      } else {
        res.error = "The output is not valid code"
      }
    } else {
      res.pass = true
    }
  }
  return res
}

export { containsCodeBlock }