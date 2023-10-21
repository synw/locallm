import { useApi } from "restmix";

/**
 * Represents the configuration of a model.
 *
 * @interface ModelConf
 * @property {string} name - The unique name of the model.
 * @property {number | undefined} ctx - The context window length, typically used to define how much of the previous data to consider.
 * @property {string | undefined} template - The name of the template to use with the model.
 * @property {number | undefined} gpu_layers - The number of layers to offload to the GPU.
 */
interface ModelConf {
  name: string;
  ctx?: number;
  template?: string;
  gpu_layers?: number;
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
 * @property {number | undefined} n_predict - The number of predictions to return.
 * @property {number | undefined} top_k - Limits the result set to the top K results.
 * @property {number | undefined} top_p - Filters results based on cumulative probability.
 * @property {number | undefined} temperature - Adjusts randomness in sampling; higher values mean more randomness.
 * @property {number | undefined} frequency_penalty - Adjusts penalty for frequency of tokens.
 * @property {number | undefined} presence_penalty - Adjusts penalty for presence of tokens.
 * @property {number | undefined} repeat_penalty - Adjusts penalty for repeated tokens.
 * @property {number | undefined} tfs_z - Used for custom tuning.
 * @property {Array<string> | undefined} stop - List of stop words or phrases to halt predictions.
 * @property {Record<string, any> | undefined} extra - Extra parameters to include in the payload
 */
interface InferenceParams {
  stream?: boolean;
  model?: ModelConf;
  template?: string;
  threads?: number;
  gpu_layers?: number;
  n_predict?: number;
  top_k?: number;
  top_p?: number;
  temperature?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repeat_penalty?: number;
  tfs_z?: number;
  stop?: Array<string>;
  extra?: Record<string, any>;
}

/**
 * Represents the result returned after an inference request.
 *
 * @interface InferenceResult
 * @property {string} text - The textual representation of the generated inference.
 * @property {Record<string, any> | undefined} stats - Additional statistics or metadata related to the inference.
 */
interface InferenceResult {
  text: string;
  stats?: Record<string, any>;
}

/**
 * Defines the structure and behavior of an LM Provider.
 *
 * @interface LmProvider
 * @property {string} name - Identifier for the LM provider.
 * @property {ReturnType<typeof useApi>} api - API utility being used (either restmix or goinfer based).
 * @property {string} serverUrl - The URL endpoint for the provider's server.
 * @property {string} apiKey - The key used for authentication with the provider's API.
 * @property {ModelConf} model - Active model configuration.
 * @property {Array<ModelConf>} models - List of available model configurations.
 * @property {boolean} isModelLoaded - Is the model loaded: read only.
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
  readonly isModelLoaded: boolean;
  modelsInfo: () => Promise<void>;
  loadModel: (name: string, ctx?: number, template?: string) => Promise<void>;
  infer: (prompt: string, params: InferenceParams) => Promise<InferenceResult>;
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

/**
 * Represents the type of LM provider.
 *
 * @typedef LmProviderType
 * @type {"koboldcpp" | "ollama" | "goinfer"}
 */
type LmProviderType = "koboldcpp" | "ollama" | "goinfer";

export {
  ModelConf,
  InferenceParams,
  InferenceResult,
  LmProvider,
  LmProviderType,
  LmParams,
  LmProviderParams,
  LmDefaults,
}