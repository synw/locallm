import type { ModelConf } from "./model.js";
import type { ToolSpec } from "./tools.js";
import type { HistoryTurn } from "./history.js";
import type { InferenceStats } from "./stats.js";
import type { ToolCallSpec } from "./tools.js";

/**
 * Describes the parameters for making an inference request.
 *
 * @interface InferenceParams
 * @property {boolean | undefined} stream - Indicates if results should be streamed progressively.
 * @property {ModelConf | undefined} model - The model configuration details for inference.
 * @property {string | undefined} template - The template to use, for the backends that support it.
 * @property {number | undefined} max_tokens - The number of predictions to return.
 * @property {number | undefined} top_k - Limits the result set to the top K results.
 * @property {number | undefined} top_p - Filters results based on cumulative probability.
 * @property {number | undefined} min_p - The minimum probability for a token to be considered, relative to the probability of the most likely token.
 * @property {number | undefined} temperature - Adjusts randomness in sampling; higher values mean more randomness.
 * @property {number | undefined} repeat_penalty - Adjusts penalty for repeated tokens.
 * @property {number | undefined} tfs - Set the tail free sampling value.
 * @property {Array<string> | undefined} stop - List of stop words or phrases to halt predictions.
 * @property {string | undefined} grammar - The gnbf grammar to use for grammar-based sampling.
 * @property {string | undefined} tsGrammar - A Typescript interface to be converted to a gnbf grammar to use for grammar-based sampling.
 * @property {Array<string>} images - The base64 images data (for multimodal models).
 * @property {string | undefined} schema - A json schema to format the output.
 * @property {Record<string, any> | undefined} extra - Extra parameters to include in the payload
 * @example
 * const inferenceParams: InferenceParams = {
 *   stream: true,
 *   model: { name: 'gpt-3', ctx: 2048 },
 *   template: 'default',
 *   max_tokens: 150,
 *   top_k: 50,
 *   top_p: 0.9,
 *   min_p: 0.01,
 *   temperature: 0.7,
 *   repeat_penalty: 1.2,
 *   tfs: 0.8,
 *   stop: ['###'],
 *   grammar: 'default_grammar',
 *   images: ['data:image/png;base64,...']
 * };
 */
interface InferenceParams {
    stream?: boolean;
    model?: ModelConf;
    template?: string;
    max_tokens?: number;
    top_k?: number;
    top_p?: number;
    min_p?: number;
    temperature?: number;
    repeat_penalty?: number;
    tfs?: number;
    stop?: Array<string>;
    grammar?: string;
    tsGrammar?: string;
    schema?: Record<string, any>;
    images?: Array<string>;
    extra?: Record<string, any>;
}

/**
 * Options for inference requests.
 *
 * @interface InferenceOptions
 * @property {boolean | undefined} debug - Enable debug mode for detailed logging.
 * @property {boolean | undefined} verbose - Enable verbose output.
 * @property {Array<ToolSpec> | undefined} tools - Array of available tools for the conversation.
 * @property {Array<HistoryTurn> | undefined} history - Conversation history to include in the inference.
 * @property {string | undefined} system - System message to set the context for the conversation.
 * @property {string | undefined} assistant - Assistant message to include in the context.
 * @example
 * const inferenceOptions: InferenceOptions = {
 *   debug: true,
 *   tools: [weatherTool],
 *   history: [
 *     { user: "Hello", assistant: "Hi there!" }
 *   ],
 *   system: "You are a helpful assistant."
 * };
 */
interface InferenceOptions {
    debug?: boolean;
    verbose?: boolean;
    tools?: Array<ToolSpec>;
    history?: Array<HistoryTurn>;
    system?: string;
    assistant?: string;
    onToolCall?: (tc: ToolCallSpec) => void;
    onToolCallEnd?: (tr: any) => void;
}

/**
 * Represents the result returned after an inference request.
 *
 * @interface InferenceResult
 * @property {string} text - The textual representation of the generated inference.
 * @property {InferenceStats} stats - Additional statistics or metadata related to the inference.
 * @property {Record<string, any>} serverStats - Additional server-related statistics.
 * @property {Array<ToolCallSpec> | undefined} toolCalls - Tool calls made during inference.
 * @example
 * const inferenceResult: InferenceResult = {
 *   text: 'The quick brown fox jumps over the lazy dog.',
 *   stats: {
 *     ingestionTime: 150,
 *     inferenceTime: 300,
 *     totalTime: 450,
 *     ingestionTimeSeconds: 0.15,
 *     inferenceTimeSeconds: 0.3,
 *     totalTimeSeconds: 0.45,
 *     totalTokens: 200,
 *     tokensPerSecond: 444
 *   },
 *   serverStats: { someServerKey: 'someServerValue' },
 *   toolCalls: [{ id: '1', name: 'getWeather', arguments: { location: 'New York' } }]
 * };
 */
interface InferenceResult {
    text: string;
    stats: InferenceStats;
    serverStats: Record<string, any>;
    toolCalls?: Array<ToolCallSpec>;
}

export {
    InferenceParams,
    InferenceOptions,
    InferenceResult,
}
