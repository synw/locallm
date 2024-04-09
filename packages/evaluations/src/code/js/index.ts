import { fixJsonTest } from "./fix_json.js";
import { pydantic2TsTest } from "./pydantic_to_ts.js";
import { optimizeTsTest } from "./optimize_ts.js";
import { generateJs } from "./generate_js.js";
import { LmTestCase } from "../../../../evaluate/src/testcase.js";

const tests = new Array<LmTestCase>(fixJsonTest, pydantic2TsTest, optimizeTsTest, generateJs);

export { tests }