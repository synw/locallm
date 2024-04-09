import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../../packages/evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../../packages/evaluate/src/testcase.js";


const template = new PromptTemplate("alpaca")
  .afterSystem("You are a code expert")
  .replacePrompt("convert this Pydantic schema to a Typescript interface:\n\n```python\n{prompt}```")
  .addShot(
    `class LoginFormContract(Schema):
    id: int
    username: str
    password: str
    countries: List[Dict[str, str]]
    info: str | None
    extra: Optional[Dict[str, Any]]
    option: Optional[str]
    `,
    `\n\n\`\`\`ts
interface LoginFormContract {
  id: number;
  username: string;
  password: string;
  countries: Array<Record<string, string>>;
  info: string | null;
  extra?: Record<string, any>;
  option?: string;
\`\`\`\n`,
  )
  /*.addShot(
    `class InferUsageContract(Schema):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class InferResponseContract(Schema):
    text: str
    finish_reason: str
    usage: InferUsageContract`,
    `interface InferUsageContract {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    }
    
    interface InferResponseContract {
      text: string;
      finish_reason: string;
      usage: InferUsageContract;
    }`
  )*/;
const prompt = `class CompanyData(Schema):
    name: str
    currencies: Dict[str, int]
    countries: List[Dict[str, str]]
    codes: Optional[List[Dict[str, str]]]`;

const evaluator = new Evaluator()
  .containsCode(50)
  .containsText(50, [
    "name: string",
    "currencies: Record<string, number>",
    "countries: Array<Record<string, string>>",
    "codes?: Array<Record<string, string>>"
  ])

const inferParams: InferenceParams = {
  temperature: 0,
  max_tokens: 250,
};
const pydantic2TsTest = new LmTestCase({
  name: "pydantic_to_ts",
  prompt: prompt,
  template: template,
  evaluator: evaluator,
  inferParams: inferParams,
});

export { pydantic2TsTest }

