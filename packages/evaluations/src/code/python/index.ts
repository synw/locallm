import { LmTestCase } from "@/packages/evaluate/testcase.js";
import { createDocstringTest } from "./create_docstring.js";

const tests = new Array<LmTestCase>(createDocstringTest);

export { tests }