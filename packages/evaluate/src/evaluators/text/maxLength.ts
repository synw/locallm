import { EvaluationResult } from "../../interfaces.js";

function maxLength(response: string, name: string, max: number, error: string | null = null): EvaluationResult {
    let pass = false;
    let err: string | null = null;
    if (response.length <= max) {
        pass = true;
    } else {
        err = `The response length is over ${max} characters`
    }
    const res: EvaluationResult = {
        name: name,
        pass: pass,
        error: err,
    };
    return res
}

export { maxLength }