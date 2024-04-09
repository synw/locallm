import { trimStr } from "../../utils.js";
import { EvaluationResult } from "../../interfaces.js";

function isOnlyCodeBlock(response: string, name: string, param: any, error: string | null = null): EvaluationResult {
    const res: EvaluationResult = {
        name: name,
        pass: false,
        error: null,
    };
    const trimedStr = trimStr(response);
    if (trimedStr.startsWith("```") && trimedStr.endsWith("```")) {
        res.pass = true;
    } else {
        res.error = "The output is not only a code block"
    }
    return res
}

export { isOnlyCodeBlock }