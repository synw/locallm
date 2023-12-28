import { LmTestCase } from "../../evaluate/src/testcase";

async function loadTestCases(testRunName: string): Promise<Array<LmTestCase>> {
  const { tests } = await import("./" + testRunName + "/index.ts");
  return tests
}

export { loadTestCases }