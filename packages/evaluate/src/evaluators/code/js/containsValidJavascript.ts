import { EvaluationResult } from "../../../interfaces.js";
import { extractCodeBetweenTags } from "../../../utils.js";

function containsValidJavascript(response: string, name: string, param: any, error: string | null = null): EvaluationResult {
  const res: EvaluationResult = {
    name: name,
    pass: false,
    error: null,
  };
  let code = response;
  if (response.includes("```")) {
    code = extractCodeBetweenTags(response) ?? response;
  }
  try {
    new Function(code);
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