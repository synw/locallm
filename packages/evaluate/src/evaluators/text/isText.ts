import { trimStr } from "../../utils.js";
import { EvaluationResult } from "../../interfaces.js";

function isText(response: string, name: string, strs: string | Array<string>, error: string | null = null): EvaluationResult {
  let pass = false;
  let err: string | null = null;
  let conditions = new Array<string>();
  if (typeof strs == "string") {
    conditions.push(strs)
  } else {
    conditions = strs
  }
  const trimedStr = trimStr(response);
  if (conditions.includes(trimedStr)) {
    pass = true;
  } else {
    err = `The response is not in: ${conditions.join(", ")}`
  }
  const res: EvaluationResult = {
    name: name,
    pass: pass,
    error: err,
  };
  return res
}

export { isText }