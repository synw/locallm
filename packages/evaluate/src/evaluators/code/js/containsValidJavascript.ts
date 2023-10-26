import { EvaluationResult } from "../../../interfaces.js";
import { extractCodeBetweenTags } from "../../../utils.js";

function containsValidJavascript(response: string, name: string, param: any, error: string | null = null): EvaluationResult {
  const res: EvaluationResult = {
    name: name,
    pass: false,
    error: null,
  };
  try {
    let code: string | null = null;
    if (response.includes("```")) {
      code = extractCodeBetweenTags(response);
    }
    if (!code) {
      error = "The output does not contain a code block"
    } else {
      new Function(code);
    }
  } catch (e) {
    if (error) {
      res.error = error
    } else {
      res.error = "The output is not valid javascript"
    }
  }
  return res
}

export { containsValidJavascript }