import { useApi } from "restmix";

/**
 * Represents the configuration of a model.
 *
 * @interface ModelConf
 * @property {string} name - The unique name of the model.
 * @property {number | undefined} ctx - The context window length, typically used to define how much of the previous data to consider.
 * @property {string | undefined} threads - The number of threads to use to run inference.
 * @property {number | undefined} gpu_layers - The number of layers to offload to the GPU.
 * @property {number | undefined} info - Some meta info about the model: parameter size and quantization level
 */
interface ModelConf {
  name: string;
  ctx: number;
  threads?: number;
  gpu_layers?: number;
  info?: { size: string, quant: string };
}

/**
 * Describes the parameters for making an inference request.
 *
 * @interface InferenceParams
 * @property {boolean | undefined} stream - Indicates if results should be streamed progressively.
 * @property {ModelConf | undefined} model - The model configuration details for inference.
 * @property {template | undefined} template - The template to use, for the backends that support it.
 * @property {number | undefined} threads - The number of threads to use for parallel processing.
 * @property {number | undefined} gpu_layers - The number of layers to offload to the GPU.
 * @property {number | undefined} max_tokens - The number of predictions to return.
 * @property {number | undefined} top_k - Limits the result set to the top K results.
 * @property {number | undefined} top_p - Filters results based on cumulative probability.
 * @property {number | undefined} min_p - The minimum probability for a token to be considered, relative to the probability of the most likely token.s
 * @property {number | undefined} temperature - Adjusts randomness in sampling; higher values mean more randomness.
 * @property {number | undefined} repeat_penalty - Adjusts penalty for repeated tokens.
 * @property {number | undefined} tfs - Set the tail free sampling value.
 * @property {Array<string> | undefined} stop - List of stop words or phrases to halt predictions.
 * @property {string | undefined} grammar - The gnbf grammar to use for grammar-based sampling.
 * @property {Array<string>} image_data - The base64 images data (for multimodal models).
 * @property {Record<string, any> | undefined} extra - Extra parameters to include in the payload
 */
interface InferenceParams {
  stream?: boolean;
  model?: ModelConf;
  template?: string;
  threads?: number;
  gpu_layers?: number;
  max_tokens?: number;
  top_k?: number;
  top_p?: number;
  min_p?: number;
  temperature?: number;
  repeat_penalty?: number;
  tfs?: number;
  stop?: Array<string>;
  grammar?: string;
  images?: Array<string>;
  extra?: Record<string, any>;
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
 */
interface InferenceStats {
  ingestionTime: number;
  inferenceTime: number;
  totalTime: number;
  ingestionTimeSeconds: number;
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
 * @property {Record<string, any> | undefined} data - Additional data related to the inference.
 * @property {InferenceStats} stats - Additional statistics or metadata related to the inference.
 * @property {Record<string, any>} serverStats - Additional server-related statistics.
 */
interface InferenceResult {
  text: string;
  data: Record<string, any>;
  stats: InferenceStats;
  serverStats: Record<string, any>;
}

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
 * @property {Function} info - Retrieves information about available server config.
 * @property {Function} modelsInfo - Retrieves information about available models.
 * @property {Function} loadModel - Loads a model by name, with optional context and template.
 * @property {Function} infer - Makes an inference based on provided prompt and parameters.
 * @property {Function} abort - Aborts a currently running inference task.
 * @property {Function} onToken - Callback when a new token is received (typically for authentication).
 * @property {Function | undefined} onStartEmit - Callback triggered when inference starts.
 * @property {Function | undefined} onError - Callback triggered on errors during inference.
 * @property {LmDefaults | undefined} defaults - Default settings for this provider.
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
  loadModel: (name: string, ctx?: number, threads?: number, gpu_layers?: number) => Promise<void>;
  infer: (prompt: string, params: InferenceParams, parseJson?: boolean, parseJsonFunc?: (data: string) => Record<string, any>) => Promise<InferenceResult>;
  abort: () => Promise<void>;
  onToken?: (t: string) => void;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}

/**
 * Default parameters that can be used with an LM provider.
 *
 * @interface LmDefaults
 * @property {ModelConf | undefined} model - Default model conf to use.
 * @property {InferenceParams | undefined} inferenceParams - Default inference parameters.
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
 * @property {string} apiKey - The key used for authentication.
 * @property {Function} onToken - Callback when a new token is received.
 * @property {Function | undefined} onStartEmit - Callback triggered when inference starts.
 * @property {Function | undefined} onError - Callback triggered on errors.
 * @property {LmDefaults | undefined} defaults - Default settings.
 */
interface LmProviderParams {
  name: string;
  serverUrl: string;
  apiKey: string;
  onToken?: (t: string) => void;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}

/**
 * Parameters for initializing a Language Model.
 *
 * @interface LmParams
 * @property {LmProviderType} providerType - Type of provider ("koboldcpp", "ollama", "goinfer").
 * @property {string} serverUrl - The URL endpoint for the LM service.
 * @property {Function} onToken - Callback when a new token is received.
 * @property {string | undefined} apiKey - Optional API key for authentication.
 * @property {Function | undefined} onStartEmit - Callback triggered when inference starts.
 * @property {Function | undefined} onError - Callback triggered on errors.
 * @property {LmDefaults | undefined} defaults - Default settings.
 */
interface LmParams {
  providerType: LmProviderType;
  serverUrl: string;
  onToken: (t: string) => void;
  apiKey?: string;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}

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
 * @property {string} loadedModel - The loaded model name, empty if no model is loaded.
 * @property {number} ctx - The loaded model context widow size, 0 if no model is loaded.
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
 * @type {"llamacpp" | "koboldcpp" | "ollama"}
 */
type LmProviderType = "llamacpp" | "koboldcpp" | "ollama";

export {
  ModelConf,
  InferenceParams,
  InferenceResult,
  InferenceStats,
  LmProvider,
  LmProviderType,
  LmParams,
  LmProviderParams,
  LmDefaults,
  ModelTemplate,
  ModelState,
}