import { useApi } from "restmix";
import { InferenceParams, InferenceResult, LmProvider, LmProviderParams, ModelConf } from "@locallm/types";
import { loadModelFromConf } from "../utils.js";


class OllamaProvider implements LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  onToken: (t: string) => void;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  // state
  model: ModelConf = { name: "" };
  models = new Array<ModelConf>();
  modelTemplates: Record<string, string> = {};
  abortController = new AbortController();
  apiKey: string;
  serverUrl: string;

  /**
   * Creates a new instance of the OllamaProvider.
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
    this.api = useApi({
      serverUrl: params.serverUrl,
    });
  }

  /**
   * Checks if a model is currently loaded.
   *
   * @returns {boolean} - Returns true if a model is loaded, otherwise false.
   */
  get isModelLoaded(): boolean {
    return this.model.name.length > 0
  }

  /**
   * Not implemented for this provider
   *
   * @async
   * @returns {Promise<void>}
   */
  async modelsInfo(): Promise<void> {
    console.warn("Not implemented for this provider")
  }

  /**
   * Loads a specified model for inferences. Note: in this provider
   * the model is set internaly and Ollama will load it into memory
   * when an inference query starts
   *
   * @async
   * @param {string} name - The name of the model to load.
   * @param {number} [ctx] - The optional context window length.
   * @param {string} [template] - The name of the template to use with the model.
   * @returns {Promise<void>}
   */
  async loadModel(name: string, ctx?: number, template?: string): Promise<void> {
    this.model = loadModelFromConf(name, this.models, ctx, template)
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
    this.abortController = new AbortController();
    const inferParams = {
      stream: true,
      model: this.model.name,
      prompt: prompt,
      num_ctx: this.model.ctx,
      num_thread: params.threads,
      repeat_penalty: params.repeat_penalty,
      stop_sequence: params.stop ? params.stop.join(",") : undefined,
      temperature: params.temperature,
      tfs_z: params.tfs_z,
      top_k: params.top_k,
      top_p: params.top_p,
      num_predict: params.n_predict,
      ...params.extra,
    };
    const body = JSON.stringify({ ...inferParams });
    const buf = new Array<string>();
    const response = await fetch(`${this.serverUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    if (!response.body) {
      throw new Error("No response body")
    }
    const reader = response.body.getReader();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const raw = new TextDecoder().decode(value);
      const d = JSON.parse(raw);
      if (d["done"]) {
        break
      }
      const t = d["response"];
      text += t;
      this.onToken(t);
    }

    return {
      text: buf.join(""),
      stats: {
        totalTokens: buf.length,
      }
    } as InferenceResult
  }

  /**
   * Aborts a currently running inference task.
   *
   * @async
   * @returns {Promise<void>}
   */
  async abort(): Promise<void> {
    this.abortController.abort()
  }
}

export { OllamaProvider }