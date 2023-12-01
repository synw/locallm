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
 * Image data
 *
 * @interface ImgData
 * @typedef {ImgData}
 */
interface ImgData {
  id: number;
  data: string;
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
 * @property {number | undefined} frequency_penalty - Adjusts penalty for frequency of tokens.
 * @property {number | undefined} presence_penalty - Adjusts penalty for presence of tokens.
 * @property {number | undefined} repeat_penalty - Adjusts penalty for repeated tokens.
 * @property {number | undefined} tfs - Set the tail free sampling value.
 * @property {Array<string> | undefined} stop - List of stop words or phrases to halt predictions.
 * @property {string | undefined} grammar - The gnbf grammar to use for grammar-based sampling.
 * @property {Array<ImgData>} image_data - The base64 images data (for multimodal models).
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
  frequency_penalty?: number;
  presence_penalty?: number;
  repeat_penalty?: number;
  tfs?: number;
  stop?: Array<string>;
  grammar?: string;
  image_data?: Array<ImgData>;
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
 * @property {ReturnType<typeof useApi>} api - API utility being used.
 * @property {string} serverUrl - The URL endpoint for the provider's server.
 * @property {string} apiKey - The key used for authentication with the provider's API.
 * @property {ModelConf} model - Active model configuration.
 * @property {Array<ModelConf>} models - List of available model configurations.
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
 * @type {"llamacpp" | "koboldcpp" | "ollama" | "goinfer"}
 */
type LmProviderType = "llamacpp" | "koboldcpp" | "ollama" | "goinfer";

export {
  ModelConf,
  InferenceParams,
  InferenceResult,
  LmProvider,
  LmProviderType,
  LmParams,
  LmProviderParams,
  LmDefaults,
  ModelTemplate,
  ModelState,
  ImgData,
}