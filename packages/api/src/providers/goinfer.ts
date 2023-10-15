import { useGoinfer } from "@goinfer/api";
import { InferParams } from "@goinfer/types";
import { InferenceParams, InferenceResult, LmProvider, LmProviderParams, ModelConf } from "@locallm/types";
import { loadModelFromConf } from "../utils.js";

/**
 * Implements the language model provider for the Goinfer service.
 * This class allows for interactions with the Goinfer API to manage models,
 * perform inferences, and handle various related tasks.
 * 
 * @implements {LmProvider}
 */
class GoinferProvider implements LmProvider {
  name: string;
  api: ReturnType<typeof useGoinfer>;
  onToken: (t: string) => void;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;

  /** Current active model configuration */
  model: ModelConf = { name: "" };

  /** List of available model configurations */
  models = new Array<ModelConf>();

  apiKey: string;
  serverUrl: string;

  /**
   * Creates a new instance of the GoinferProvider.
   *
   * @param {LmProviderParams} params - Configuration parameters for initializing the provider.
   */
  constructor(params: LmProviderParams) {
    this.name = params.name;
    this.onToken = params.onToken;
    this.onStartEmit = params.onStartEmit;
    this.onError = params.onError;
    this.apiKey = params.apiKey;
    this.serverUrl = params.serverUrl;
    this.api = useGoinfer({
      serverUrl: params.serverUrl,
      apiKey: params.apiKey,
      onToken: this.onToken,
      onStartEmit: this.onStartEmit,
      onError: this.onError,
    });
  }

  /**
   * Checks if a model is currently loaded.
   *
   * @returns {boolean} - Returns true if a model is loaded, otherwise false.
   */
  get isModelLoaded(): boolean {
    return this.model.name.length > 0;
  }

  /**
   * Fetches and stores the list of available models from the Goinfer API.
   *
   * @async
   * @returns {Promise<void>}
   */
  async modelsInfo(): Promise<void> {
    const res = await this.api.modelsState();
    for (const [modelName, template] of Object.entries(res.models)) {
      this.models.push({
        name: modelName,
        ctx: template.ctx,
        template: template.name,
      });
    }
  }

  /**
   * Loads a specified model into memory for inferences.
   *
   * @async
   * @param {string} name - The name of the model to load.
   * @param {number} [ctx] - The optional context window length.
   * @param {string} [template] - The name of the template to use with the model.
   * @returns {Promise<void>}
   */
  async loadModel(name: string, ctx?: number, template?: string): Promise<void> {
    const _model = loadModelFromConf(name, this.models, ctx, template);
    await this.api.loadModel({ name: name, ctx: _model.ctx ?? 2048 });
    this.model = _model;
  }

  /**
   * Makes an inference based on the provided prompt and parameters.
   *
   * @async
   * @param {string} prompt - The input text to base the inference on.
   * @param {InferenceParams} params - Parameters for customizing the inference behavior.
   * @returns {Promise<InferenceResult>} - The result of the inference.
   */
  async infer(prompt: string, params: InferenceParams): Promise<InferenceResult> {
    params.stream = true;
    const res = await this.api.infer(prompt, undefined, params as InferParams);
    return {
      text: res.text,
      stats: {
        totalTokens: res.totalTokens,
      },
    } as InferenceResult;
  }

  /**
   * Aborts a currently running inference task.
   *
   * @async
   * @returns {Promise<void>}
   */
  async abort(): Promise<void> {
    this.api.abort();
  }
}

export { GoinferProvider };
