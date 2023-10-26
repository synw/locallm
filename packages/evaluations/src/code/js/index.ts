import { fixJsonTest } from "./fix_json.js";
import { pydantic2TsTest } from "./pydantic_to_ts.js";
import { optimizeTsTest } from "./optimize_ts.js";
import { generateJs } from "./generate_js.js";

const tests = [fixJsonTest, pydantic2TsTest, optimizeTsTest, generateJs];

export { tests }