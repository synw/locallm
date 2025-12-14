/**
 * Represents the configuration of a model.
 *
 * @interface ModelConf
 * @property {string} name - The unique name of the model.
 * @property {number | undefined} ctx - The context window length, typically used to define how much of the previous data to consider.
 * @property {{ size: string, quant: string } | undefined} info - Some meta info about the model: parameter size and quantization level
 * @property {Record<string, any> | undefined} extra - Extra parameters like urls for browser models
 * @example
 * const modelConf: ModelConf = {
 *   name: 'qwen4b',
 *   ctx: 2048,
 *   info: { size: '175B', quant: 'q4_0' },
 *   extra: { url: 'http://example.com/model' }
 * };
 */
interface ModelConf<T = Record<string, any>> {
    name: string;
    ctx?: number;
    info?: { size: string, quant: string };
    extra?: T;
}

/**
 * Template information for model.
 *
 * @interface ModelTemplate
 * @property {string} name - The name of the template.
 * @property {number | undefined} ctx - The context window size for the model.
 * @example
 * const modelTemplate: ModelTemplate = {
 *   name: 'default_template',
 *   ctx: 2048
 * };
 */
interface ModelTemplate {
    name: string;
    ctx?: number;
}

/**
 * Represents the state of the available models on server.
 *
 * @interface ModelState
 * @property {Record<string, ModelTemplate>} models - The models info object (name, template name, context window size).
 * @property {boolean} isModelLoaded - Indicates whether a model is loaded or not.
 * @property {string} loadedModel - The loaded model name, empty if no model is loaded.
 * @property {number | undefined} ctx - The loaded model context window size, 0 if no model is loaded.
 * @example
 * const modelState: ModelState = {
 *   models: { gpt3: { name: 'qwen4b', ctx: 2048 } },
 *   isModelLoaded: true,
 *   loadedModel: 'qwen4b',
 *   ctx: 2048
 * };
 */
interface ModelState {
    models: Record<string, ModelTemplate>;
    isModelLoaded: boolean;
    loadedModel: string;
    ctx?: number;
}

/**
 * Represents the unloaded model status.
 *
 * @interface ModelStatusUnloaded
 * @property {"unloaded"} value - The status value indicating the model is unloaded.
 * @example
 * const unloadedStatus: ModelStatusUnloaded = {
 *   value: "unloaded"
 * };
 */
interface ModelStatusUnloaded {
    value: "unloaded";
}

/**
 * Represents the loading model status.
 *
 * @interface ModelStatusLoading
 * @property {"loading"} value - The status value indicating the model is loading.
 * @property {string[]} args - Arguments used during the loading process.
 * @example
 * const loadingStatus: ModelStatusLoading = {
 *   value: "loading",
 *   args: ["--model", "qwen4b"]
 * };
 */
interface ModelStatusLoading {
    value: "loading";
    args: string[];
}

/**
 * Represents the failed model status.
 *
 * @interface ModelStatusFailed
 * @property {"failed"} value - The status value indicating the model failed to load.
 * @property {string[]} args - Arguments used during the loading process.
 * @property {true} failed - Indicates that the model loading failed.
 * @property {number} exit_code - The exit code from the failed loading process.
 * @example
 * const failedStatus: ModelStatusFailed = {
 *   value: "failed",
 *   args: ["--model", "qwen4b"],
 *   failed: true,
 *   exit_code: 1
 * };
 */
interface ModelStatusFailed {
    value: "failed";
    args: string[];
    failed: true;
    exit_code: number;
}

/**
 * Represents the loaded model status.
 *
 * @interface ModelStatusLoaded
 * @property {"loaded"} value - The status value indicating the model is loaded.
 * @property {string[]} args - Arguments used during the loading process.
 * @example
 * const loadedStatus: ModelStatusLoaded = {
 *   value: "loaded",
 *   args: ["--model", "qwen4b"]
 * };
 */
interface ModelStatusLoaded {
    value: "loaded";
    args: string[];
}

/**
 * Represents the status of a model.
 * @example
 * const status: ModelStatus = {
 *   value: "loaded",
 *   args: ["--model", "qwen4b"]
 * };
 */
type ModelStatus = ModelStatusUnloaded | ModelStatusLoading | ModelStatusFailed | ModelStatusLoaded;

/**
 * Represents data about a model.
 *
 * @interface ModelData
 * @property {string} id - The unique identifier of the model.
 * @property {boolean} in_cache - Indicates if the model is in cache.
 * @property {string} path - The file path of the model.
 * @property {ModelStatus} status - The current status of the model.
 * @example
 * const modelData: ModelData = {
 *   id: "model-123",
 *   in_cache: true,
 *   path: "/models/qwen4b",
 *   status: { value: "loaded", args: ["--model", "qwen4b"] }
 * };
 */
interface ModelData {
    id: string;
    in_cache: boolean;
    path: string;
    status: ModelStatus;
}

/**
 * Represents the API response for model data.
 *
 * @interface ModelApiResponse
 * @property {ModelData[]} data - Array of model data objects.
 * @example
 * const apiResponse: ModelApiResponse = {
 *   data: [
 *     {
 *       id: "model-123",
 *       in_cache: true,
 *       path: "/models/qwen4b",
 *       status: { value: "loaded", args: ["--model", "qwen4b"] }
 *     }
 *   ]
 * };
 */
interface ModelApiResponse {
    data: ModelData[];
}

export {
    ModelConf,
    ModelTemplate,
    ModelState,
    ModelApiResponse,
    ModelData,
    ModelStatus,
    ModelStatusFailed,
    ModelStatusLoaded,
    ModelStatusLoading,
    ModelStatusUnloaded,
}
