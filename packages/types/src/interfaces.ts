
import type { useApi } from "restmix";

/**.
 * Represents the configuration of a model.
 *
 * @interface ModelConf
 * @property {string} name - The unique name of the model.
 * @property {number | undefined} ctx - The context window length, typically used to define how much of the previous data to consider.
 * @property {{ size: string, quant: string } | undefined} info - Some meta info about the model: parameter size and quantization level
 * @property {Record<string, any> | undefined} extra - Extra parameters like urls for browser models
 * @example
 * const modelConf: ModelConf = {
 *   name: 'gpt-3',
 *   ctx: 2048,
 *   info: { size: '175B', quant: 'q4_0' },
 *   extra: { url: 'http://example.com/model' }
 * };
 */
interface ModelConf {
  name: string;
  ctx?: number;
  info?: { size: string, quant: string };
  extra?: Record<string, any>;
}

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
  extra?: InferenceParamsExtra;
}

interface HistoryTurn {
  user?: string;
  assistant?: string;
  tools?: { calls: Array<ToolCallSpec>, results: Array<{ id: string, content: string }> };
}

interface InferenceParamsExtra {
  system?: string;
  history?: Array<HistoryTurn>;
  tools?: Array<ToolSpec>;
  assistant?: string;
  [key: string]: any;
}

/**
 * Represents the statistics of an inference prompt ingestion time.
 *
 * @interface IngestionStats
 * @property {number} ingestionTime - The time taken to ingest the input data in milliseconds.
 * @property {number} ingestionTimeSeconds - The time taken to ingest the input data in seconds.
 * @example
 * const ingestionStats: IngestionStats = {
 *   ingestionTime: 150,
 *   ingestionTimeSeconds: 0.15
 * };
 */
interface IngestionStats {
  ingestionTime: number;
  ingestionTimeSeconds: number;
}

/**
 * Represents the statistics of an inference.
 *
 * @interface InferenceStats
 * @property {number} ingestionTime - The time taken to ingest the input data in milliseconds.
 * @property {number} inferenceTime - The time taken to perform the inference in milliseconds.
 * @property {number} totalTime - The total time taken to perform the inference in milliseconds.
 * @property {number} ingestionTimeSeconds - The time taken to ingest the input data in seconds.
 * @property {number} inferenceTimeSeconds - The time taken to perform the inference in seconds.
 * @property {number} totalTimeSeconds - The total time taken to perform the inference in seconds.
 * @property {number} totalTokens - The total number of tokens processed.
 * @property {number} tokensPerSecond - The number of tokens processed per second.
 * @example
 * const inferenceStats: InferenceStats = {
 *   ingestionTime: 150,
 *   inferenceTime: 300,
 *   totalTime: 450,
 *   ingestionTimeSeconds: 0.15,
 *   inferenceTimeSeconds: 0.3,
 *   totalTimeSeconds: 0.45,
 *   totalTokens: 200,
 *   tokensPerSecond: 444
 * };
 */
interface InferenceStats extends IngestionStats {
  totalTime: number;
  inferenceTime: number;
  inferenceTimeSeconds: number;
  totalTimeSeconds: number;
  totalTokens: number;
  tokensPerSecond: number;
}

/**
 * Represents the result returned after an inference request.
 *
 * @interface InferenceResult
 * @property {string} text - The textual representation of the generated inference.
 * @property {Record<string, any>} data - Additional data related to the inference.
 * @property {InferenceStats} stats - Additional statistics or metadata related to the inference.
 * @property {Record<string, any>} serverStats - Additional server-related statistics.
 * @example
 * const inferenceResult: InferenceResult = {
 *   text: 'The quick brown fox jumps over the lazy dog.',
 *   data: { someKey: 'someValue' },
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
 *   serverStats: { someServerKey: 'someServerValue' }
 * };
 */
interface InferenceResult {
  text: string;
  data: Record<string, any>;
  stats: InferenceStats;
  serverStats: Record<string, any>;
  toolCalls?: Array<ToolCallSpec>;
}

interface ToolCallSpec {
  id?: string;
  name: string;
  arguments?: {
    [key: string]: string;
  };
}

/**
 * Specification for a tool that can be used within the conversation.
 *
 * @interface ToolDefSpec
 * @typedef {ToolDefSpec}
 * 
 * @example
 * const toolSpecExample: ToolDefSpec = {
 *   name: "WeatherFetcher",
 *   description: "Fetches weather information.",
 *   arguments: {
 *     location: {
 *       description: "The location for which to fetch the weather.",
 *       required: true
 *     }
 *   }
 * };
 */
interface ToolDefSpec {
  /**
   * The name of the tool.
   */
  name: string;

  /**
   * A description of what the tool does.
   */
  description: string;

  /**
   * Arguments required by the tool, with descriptions for each argument.
   */
  arguments: {
    [key: string]: {
      description: string;
      type?: string;
      required?: boolean;
    };
  };
}

interface ToolSpec extends ToolDefSpec {
  execute: <O = any>(args: { [key: string]: string; } | undefined) => Promise<O>;
}

/**
 * Represents the basic progress of a load operation.
 *
 * @interface OnLoadProgressBasic
 * @property {number} total - The total number of items to load.
 * @property {number} loaded - The number of items that have been loaded so far.
 * @example
 * const onLoadProgress: OnLoadProgressBasic = {
 *   total: 100,
 *   loaded: 50
 * };
 */
interface OnLoadProgressBasic {
  total: number;
  loaded: number;
}

/**
 * Represents the full progress of a load operation, including percentage.
 *
 * @interface OnLoadProgressFull
 * @augments OnLoadProgressBasic
 * @property {number} percent - The percentage of items that have been loaded so far.
 * @example
 * const onLoadProgress: OnLoadProgressFull = {
 *   total: 100,
 *   loaded: 50,
 *   percent: 50
 * };
 */
interface OnLoadProgressFull extends OnLoadProgressBasic {
  percent: number;
}

/**
 * Type definition for a progress callback function with full details.
 *
 * @typedef OnLoadProgress
 * @type {(data: OnLoadProgressFull) => void}
 * @example
 * const onLoadProgress: OnLoadProgress = (data) => {
 *   console.log(`Loaded ${data.loaded} of ${data.total} (${data.percent}%)`);
 * };
 */
type OnLoadProgress = (data: OnLoadProgressFull) => void;

/**
 * Type definition for a basic progress callback function.
 *
 * @typedef BasicOnLoadProgress
 * @type {(data: OnLoadProgressBasic) => void}
 * @example
 * const onLoadProgress: BasicOnLoadProgress = (data) => {
 *   console.log(`Loaded ${data.loaded} of ${data.total}`);
 * };
 */
type BasicOnLoadProgress = (data: OnLoadProgressBasic) => void;

/**
 * Defines the structure and behavior of an LM Provider.
 *
 * @interface LmProvider
 * @property {string} name - Identifier for the LM provider.
 * @property {ReturnType<typeof useApi>} api - API utility being used.
 * @property {string} serverUrl - The URL endpoint for the provider's server.
 * @property {string} apiKey - The key used for authentication with the provider's API.
 * @property {ModelConf} model - Active model configuration.
 * @property {Array<ModelConf>} models - List of available model configurations.
 * @property {() => Promise<Record<string, any>>} info - Retrieves information about available server config.
 * @property {() => Promise<void>} modelsInfo - Retrieves information about available models.
 * @property {(name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) => Promise<void>} loadModel - Loads a model by name, with optional context.
 * @property {(prompt: string, params: InferenceParams, parseJson?: boolean, parseJsonFunc?: (data: string) => Record<string, any>) => Promise<InferenceResult>} infer - Makes an inference based on provided prompt and parameters.
 * @property {() => Promise<void>} abort - Aborts a currently running inference task.
 * @property {(t: string) => void} onToken - Callback when a new token is received (typically for authentication).
 * @property {(data: IngestionStats) => void} onStartEmit - Callback triggered when inference starts.
 * @property {(result: InferenceResult) => void} onEndEmit - Callback triggered when inference ends.
 * @property {(err: string) => void} onError - Callback triggered on errors during inference.
 * @property {LmDefaults | undefined} defaults - Default settings for this provider.
 * @example
 * const lmProvider: LmProvider = {
 *   name: 'koboldcpp',
 *   api: useApi(),
 *   serverUrl: 'http://example.com/api',
 *   apiKey: 'your-api-key',
 *   model: { name: 'gpt-3', ctx: 2048 },
 *   models: [{ name: 'gpt-3', ctx: 2048 }],
 *   info: async () => ({ config: 'some-config' }),
 *   modelsInfo: async () => {},
 *   loadModel: async (name, ctx, urls, onLoadProgress) => {},
 *   infer: async (prompt, params, parseJson, parseJsonFunc) => ({ text: 'result', data: {}, stats: {}, serverStats: {} }),
 *   abort: async () => {},
 *   onToken: (t) => console.log(t),
 *   onStartEmit: (data) => console.log(data),
 *   onEndEmit: (result) => console.log(result),
 *   onError: (err) => console.error(err)
 * };
 */
interface LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  serverUrl: string;
  apiKey: string;
  model: ModelConf;
  models: Array<ModelConf>;
  info: () => Promise<Record<string, any>>;
  modelsInfo: () => Promise<void>;
  loadModel: (name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) => Promise<void>;
  /**
   * Makes an inference based on provided prompt and parameters.
   *
   * @param {string} prompt - The input text for the model to generate a response from.
   * @param {InferenceParams} params - Parameters that control the behavior of the inference process.
   * @param {boolean | undefined} parseJson - Indicates whether the result should be parsed as JSON.
   * @param {(data: string) => Record<string, any> | undefined} parseJsonFunc - A custom function to parse JSON data.
   * @returns {Promise<InferenceResult>} The result of the inference process.
   */
  infer: (prompt: string, params: InferenceParams, parseJson?: boolean, parseJsonFunc?: (data: string) => Record<string, any>) => Promise<InferenceResult>;
  abort: () => Promise<void>;
  onToken?: (t: string) => void;
  onStartEmit?: (data: IngestionStats) => void;
  onEndEmit?: (result: InferenceResult) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}

/**
 * Default parameters that can be used with an LM provider.
 *
 * @interface LmDefaults
 * @property {ModelConf | undefined} model - Default model conf to use.
 * @property {InferenceParams | undefined} inferenceParams - Default inference parameters.
 * @example
 * const lmDefaults: LmDefaults = {
 *   model: { name: 'gpt-3', ctx: 2048 },
 *   inferenceParams: { max_tokens: 150, top_k: 50 }
 * };
 */
interface LmDefaults {
  model?: ModelConf;
  inferenceParams?: InferenceParams;
}

/**
 * Parameters required when creating a new LM provider instance.
 *
 * @interface LmProviderParams
 * @property {string} name - Identifier for the LM provider.
 * @property {string} serverUrl - The URL endpoint for the provider's server.
 * @property {string | undefined} apiKey - The key used for authentication.
 * @property {(t: string) => void} onToken - Callback when a new token is received.
 * @property {(data: IngestionStats) => void} onStartEmit - Callback triggered when inference starts.
 * @property {(result: InferenceResult) => void} onEndEmit - Callback triggered when inference ends.
 * @property {(err: string) => void} onError - Callback triggered on errors.
 * @property {LmDefaults | undefined} defaults - Default settings.
 * @example
 * const lmProviderParams: LmProviderParams = {
 *   name: 'koboldcpp',
 *   serverUrl: 'http://example.com/api',
 *   apiKey: 'your-api-key',
 *   onToken: (t) => console.log(t),
 *   onStartEmit: (data) => console.log(data),
 *   onEndEmit: (result) => console.log(result),
 *   onError: (err) => console.error(err)
 * };
 */
interface LmProviderParams {
  name: string;
  serverUrl: string;
  apiKey?: string;
  onToken?: (t: string) => void;
  onStartEmit?: (data: IngestionStats) => void;
  onEndEmit?: (result: InferenceResult) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}

/**
 * Parameters for initializing a Language Model.
 *
 * @interface LmParams
 * @property {LmProviderType} providerType - Type of provider ("llamacpp", "koboldcpp", "ollama", "browser").
 * @property {string} serverUrl - The URL endpoint for the LM service.
 * @property {(t: string) => void} onToken - Callback when a new token is received.
 * @property {string | undefined} apiKey - Optional API key for authentication.
 * @property {(data: IngestionStats) => void} onStartEmit - Callback triggered when inference starts.
 * @property {(result: InferenceResult) => void} onEndEmit - Callback triggered when inference ends.
 * @property {(err: string) => void} onError - Callback triggered on errors.
 * @property {LmDefaults | undefined} defaults - Default settings.
 * @example
 * const lmParams: LmParams = {
 *   providerType: 'koboldcpp',
 *   serverUrl: 'http://example.com/api',
 *   onToken: (t) => console.log(t),
 *   apiKey: 'your-api-key',
 *   onStartEmit: (data) => console.log(data),
 *   onEndEmit: (result) => console.log(result),
 *   onError: (err) => console.error(err)
 * };
 */
interface LmParams {
  providerType: LmProviderType;
  serverUrl: string;
  apiKey?: string;
  onToken?: (t: string) => void;
  onStartEmit?: (data: IngestionStats) => void;
  onEndEmit?: (result: InferenceResult) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}

/**
 * Template information for model.
 *
 * @interface ModelTemplate
 * @property {string} name - The name of the template.
 * @property {number} ctx - The context window size for the model.
 * @example
 * const modelTemplate: ModelTemplate = {
 *   name: 'default_template',
 *   ctx: 2048
 * };
 */
interface ModelTemplate {
  name: string;
  ctx: number;
}

/**
 * Represents the state of the available models on server.
 *
 * @interface ModelState
 * @property {Record<string, ModelTemplate>} models - The models info object (name, template name, context window size).
 * @property {boolean} isModelLoaded - Indicates whether a model is loaded or not.
 * @property {string} loadedModel - The loaded model name, empty if no model is loaded.
 * @property {number} ctx - The loaded model context window size, 0 if no model is loaded.
 * @example
 * const modelState: ModelState = {
 *   models: { gpt3: { name: 'gpt-3', ctx: 2048 } },
 *   isModelLoaded: true,
 *   loadedModel: 'gpt-3',
 *   ctx: 2048
 * };
 */
interface ModelState {
  models: Record<string, ModelTemplate>;
  isModelLoaded: boolean;
  loadedModel: string;
  ctx: number;
}

/**
 * Represents the type of LM provider.
 *
 * @typedef LmProviderType
 * @type {"llamacpp" | "koboldcpp" | "ollama" | "browser"}
 * @example
 * const providerType: LmProviderType = 'koboldcpp';
 */
type LmProviderType = "llamacpp" | "koboldcpp" | "ollama" | "openai" | "browser";

export {
  OnLoadProgress,
  OnLoadProgressBasic,
  OnLoadProgressFull,
  BasicOnLoadProgress,
  ModelConf,
  InferenceParams,
  InferenceResult,
  InferenceStats,
  IngestionStats,
  LmProvider,
  LmProviderType,
  LmParams,
  LmProviderParams,
  LmDefaults,
  ModelTemplate,
  ModelState,
  ToolCallSpec,
  ToolDefSpec,
  ToolSpec,
}
