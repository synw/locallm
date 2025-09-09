import type { useApi } from "restmix";
import type { ModelConf } from "./model.js";
import type { InferenceParams } from "./inference.js";
import type { InferenceOptions } from "./inference.js";
import type { InferenceResult } from "./inference.js";
import type { IngestionStats } from "./stats.js";

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
 * @property {LmProviderType} providerType - Type of provider ("llamacpp", "koboldcpp", "ollama", "openai", "browser").
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
 * @property {(prompt: string, params: InferenceParams, options?: InferenceOptions) => Promise<InferenceResult>} infer - Makes an inference based on provided prompt and parameters.
 * @property {() => Promise<void>} abort - Aborts a currently running inference task.
 * @property {(t: string) => void} onToken - Callback when a new token is received
 * @property {(data: IngestionStats) => void} onStartEmit - Callback triggered when inference starts.
 * @property {(result: InferenceResult) => void} onEndEmit - Callback triggered when inference ends.
 * @property {(err: string) => void} onError - Callback triggered on errors during inference.
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
 *   infer: async (prompt, params, options) => ({ text: 'result', stats: {}, serverStats: {} }),
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
     * @param {InferenceOptions | undefined} options - Some options for the inference query
     * @returns {Promise<InferenceResult>} The result of the inference process.
     */
    infer: (prompt: string, params: InferenceParams, options?: InferenceOptions) => Promise<InferenceResult>;
    abort: () => Promise<void>;
    onToken?: (t: string) => void;
    onStartEmit?: (data: IngestionStats) => void;
    onEndEmit?: (result: InferenceResult) => void;
    onError?: (err: string) => void;
    defaults?: LmDefaults;
}

/**
 * Represents the type of LM provider.
 *
 * @typedef LmProviderType
 * @type {"llamacpp" | "koboldcpp" | "ollama" | "openai" | "browser"}
 * @example
 * const providerType: LmProviderType = 'koboldcpp';
 */
type LmProviderType = "llamacpp" | "koboldcpp" | "ollama" | "openai" | "browser";

export {
    OnLoadProgress,
    OnLoadProgressBasic,
    OnLoadProgressFull,
    BasicOnLoadProgress,
    LmProvider,
    LmProviderType,
    LmParams,
    LmProviderParams,
    LmDefaults,
}
