import { cotFormat } from "./cot";
import { jsonFormat } from "./json";
import { simpleFormat } from "./simple";
import { cotPoints } from "./cot_points";
import { LmTestCase } from "../../../../evaluate/src/testcase.js";

const tests = new Array<LmTestCase>(
    simpleFormat, jsonFormat, cotFormat, cotPoints
);

export { tests }