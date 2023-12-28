import { InferenceParams } from "@locallm/types";
import { PromptTemplate } from "modprompt";
import { Evaluator } from "../../../../../packages/evaluate/src/evaluate.js";
import { LmTestCase } from "../../../../../packages/evaluate/src/main.js";


const template = new PromptTemplate("alpaca")
  .afterSystem("You are a javascript expert")
  .replacePrompt("I have the following javascript code:\n\n```\n{prompt}\n```\n\nGiven the related comment strings, please generate the required code. You may define helper functions if it is necessary. Please ensure that the generated code does exactly what the comments say it does. IMPORTANT: Only return the code inside of a code fence and nothing else. Do not explain your changes in any way. IMPORTANT: If I have given you additional code that does not have a comment, then I have included it only for context - do not include it in your response, only use it to better understand the code you need to generate.");
const prompt = `/* Function to create a Leaflet map with Openstreetmaps tiles.
It takes latitude, longitude, and zoom_level as parameters. Add
a marker in the map at center position
*/
function createMap( {`;

const evaluator = new Evaluator()
  .containsValidJavascript(50)
  .containsText(50, [
    "L.map(",
    "L.tileLayer(",
    "tile.openstreetmap.org/{z}/{x}/{y}.png",
    "L.marker(",
    ".addTo("
  ],
    "The javascript output does not match the expected data"
  )

const inferParams: InferenceParams = {
  temperature: 0,
  max_tokens: 250,
};
const generateJs = new LmTestCase({
  name: "generate js code",
  prompt: prompt,
  template: template,
  evaluator: evaluator,
  inferParams: inferParams,
});

export { generateJs }

