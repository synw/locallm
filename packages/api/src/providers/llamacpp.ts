import { useApi } from 'restmix';
import { InferenceParams, InferenceResult, LmProvider, LmProviderParams, ModelConf } from "@locallm/types";


class LlamacppProvider implements LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  onToken?: (t: string) => void;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  // state
  model: ModelConf = { name: "" };
  models = new Array<ModelConf>();
  abortController = new AbortController();
  apiKey: string;
  serverUrl: string;

  /**
   * Creates a new instance of the KoboldcppProvider.
   *
   * @param {LmProviderParams} params - Configuration parameters for initializing the provider.
   */
  constructor(params: LmProviderParams) {
    this.name = params.name;
    this.onToken = params.onToken;
    this.onStartEmit = params.onStartEmit;
    this.onError = params.onError;
    this.api = useApi({
      serverUrl: params.serverUrl,
      credentials: "omit",

    });
    this.apiKey = params.apiKey;
    this.serverUrl = params.serverUrl;
    //this.api.addHeader("Authorization", `Bearer ${apiKey}`);
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
   * Not implemented for this provider
   *
   * @async
   * @returns {Promise<void>}
   */
  async loadModel(name: string, ctx?: number, template?: string, gpu_layers?: number): Promise<void> {
    const res = await this.api.post<Record<string, any>>("/completion", {});
    if (res.ok) {
      //console.log("RES", res.data)
      this.model.ctx = res.data.generation_settings.n_ctx;
      this.model.name = res.data.model.split("/").pop();
    }
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
    if (params?.template) {
      prompt = params.template.replace("{prompt}", prompt);
    }
    const inferenceParams: Record<string, any> = params;
    inferenceParams.prompt = prompt;
    if ("max_tokens" in params) {
      inferenceParams.n_predict = params.max_tokens;
    }
    if ("tfs" in params) {
      inferenceParams.tfs_z = params.tfs;
    }

    let respData: InferenceResult = { text: "", stats: {} };
    let i = 0;
    if (inferenceParams?.stream == true) {
      const _onChunk = (payload: Record<string, any>) => {
        if (i == 0) {
          if (this.onStartEmit) {
            this.onStartEmit()
          }
        }
        if (!payload.stop) {
          if (this.onToken) {
            const token = `${payload.content}`;
            this.onToken(token);
            respData.text += token
          }
        } else {
          respData.stats = payload;
        }
        ++i
      }

      await this.api.postSse<Record<string, any>>(
        "/completion",
        inferenceParams,
        _onChunk,
        this.abortController,
      )
    } else {
      const res = await this.api.post<Record<string, any>>("/completion", inferenceParams);
      //console.log("RES", res)
      if (res.ok) {
        const raw = res.data as Record<string, any>;
        respData.text = raw.content;
        delete raw.content;
        respData.stats = raw;
      } else {
        const msg = res.data;
        throw new Error(`${res.statusText} ${msg.content}`);
      }
    }

    return respData
  }

  /**
   * Aborts a currently running inference task.
   *
   * @async
   * @returns {Promise<void>}
   */
  async abort(): Promise<void> {
    this.abortController.abort();
    const res = await this.api.post("/api/extra/abort", { genKey: "" });
    console.log(res)
  }
}

export { LlamacppProvider }