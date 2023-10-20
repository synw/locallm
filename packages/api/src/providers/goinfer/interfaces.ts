import { ModelConf } from "@locallm/types";

/** Template information for model
*
* @interface ModelTemplate
* @property {string} name - The name of the template
* @property {number} ctx - The context window size for the model
*/
interface ModelTemplate {
  name: string;
  ctx: number;
}

/**
 * Represents the state of the available models on server.
 *
 * @interface ModelState
 * @property {Record<string, ModelTemplate>;} models - The models info object (name, template name, context window size)
 * @property {boolean} isModelLoaded - Indicates whether a model is loaded or not.
 * @property {string} loadedModel - The name of the loaded model, empty if no model is loaded.
 * @property {number} ctx - The context value.
 */
interface ModelState {
  models: Record<string, ModelTemplate>;
  isModelLoaded: boolean;
  loadedModel: ModelConf;
}

enum MsgType {
  TokenMsgType = "token",
  SystemMsgType = "system",
  ErrorMsgType = "error",
}

/**
 * Represents a streamed message.
 *
 * @interface StreamedMessage
 * @property {string} content - The content of the message.
 * @property {number} num - The number associated with the message.
 * @property {MsgType} type - The type of the message.
 * @property {Object.<string, any> | undefined} [data] - Additional data associated with the message.
 */
interface StreamedMessage {
  content: string;
  num: number;
  type: MsgType;
  data?: { [key: string]: any };
}

/**
 * Represents the statistics related to the inference process.
 *
 * @interface TempInferStats
 * @property {number} thinkingTime - The amount of time taken for thinking during the inference.
 * @property {string} thinkingTimeFormat - The format of the thinking time (e.g., milliseconds, seconds).
 */
interface TempInferStats {
  thinkingTime: number;
  thinkingTimeFormat: string;
}

export { ModelState, ModelTemplate, MsgType, StreamedMessage, TempInferStats }