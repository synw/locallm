import { containsOneOccurrence } from "../../utils.js";
import { EvaluationResult } from "../../interfaces.js";

function containsOnlyOne(response: string, name: string, strs: string | Array<string>, error: string | null = null): EvaluationResult {
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
    const occ = containsOneOccurrence(response, condition);
    if (occ == null || occ == false) {
      let defaultError = `The response does not contain the "${condition}" string`;
      if (occ == false) {
        defaultError = `The response contains more than one occurence of the "${condition}" string`;
      }
      if (error) {
        errs.push(error);
      } else {
        errs.push(defaultError)
      }
    } else {
      passN--
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

export { containsOnlyOne }