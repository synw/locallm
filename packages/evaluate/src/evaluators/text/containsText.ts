import { EvaluationResult } from "../../interfaces.js";

function containsText(response: string, name: string, strs: string | Array<string>, error: string | null = null): EvaluationResult {
  let conditions = new Array<string>();
  if (typeof strs == "string") {
    conditions.push(strs)
  } else {
    conditions = strs
  }
  const res: EvaluationResult = {
    name: name,
    pass: false,
    error: null,
  };
  const errs = new Array<string>();
  let passN = conditions.length;
  for (const condition of conditions) {
    if (response.includes(condition)) {
      passN--
    } else {
      const defaultError = `The response does not contain the "${condition}" string`
      if (error) {
        errs.push(error);
      } else {
        errs.push(defaultError)
      }
      break
    }
  }
  if (passN == 0) {
    res.pass = true
  }
  if (errs.length > 0) {
    res.error = errs.join("\n")
  }
  return res
}

export { containsText }