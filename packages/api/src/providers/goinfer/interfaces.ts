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

export { MsgType, StreamedMessage, TempInferStats }