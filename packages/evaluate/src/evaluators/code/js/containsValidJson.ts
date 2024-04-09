import { EvaluationResult } from "../../../interfaces.js";
import { extractCodeBetweenTags } from "../../../utils.js";

function containsValidJson(response: string, name: string, param: any, error: string | null = null): EvaluationResult {
  const res: EvaluationResult = {
    name: name,
    pass: false,
    error: null,
  };
  let code: string | null = null;
  if (response.includes("```")) {
    code = extractCodeBetweenTags(response);
  } else {
    code = response;
  }
  if (!code) {
    res.error = "The output does not contain a code block"
    return res
  }
  try {
    JSON.parse(code);
  } catch (e) {
    if (error) {
      res.error = error
    } else {
      res.error = "The output is not valid json"
    }
  }
  res.pass = true;
  return res
}

export { containsValidJson }
