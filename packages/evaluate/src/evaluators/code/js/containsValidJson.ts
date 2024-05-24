import { EvaluationResult } from "../../../interfaces.js";
import { extractCodeBetweenTags } from "../../../utils.js";

function containsValidJson(response: string, name: string, param: any, error: string | null = null): EvaluationResult {
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
    JSON.parse(code);
    res.pass = true;
  } catch (e) {
    if (error) {
      res.error = error
    } else {
      res.error = "The output does not contain valid json"
    }
  }
  return res
}

export { containsValidJson }
