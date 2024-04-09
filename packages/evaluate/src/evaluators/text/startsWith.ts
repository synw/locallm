import { trimStr } from "../../utils.js";
import { EvaluationResult } from "../../interfaces.js";

function startsWith(response: string, name: string, strs: string | Array<string>, error: string | null = null): EvaluationResult {
  let pass = false;
  let err: string | null = null;
  let conditions = new Array<string>();
  if (typeof strs == "string") {
    conditions.push(strs)
  } else {
    conditions = strs
  }
  const trimedStr = trimStr(response);
  //console.log("TRIMED:", "|" + trimedStr + "|");
  for (const str of conditions) {
    if (trimedStr.startsWith(str)) {
      pass = true;
      break;
    }
  }
  if (!pass) {
    err = `The response does not start with ${strs}`
  }
  const res: EvaluationResult = {
    name: name,
    pass: pass,
    error: err,
  };
  return res
}

export { startsWith }