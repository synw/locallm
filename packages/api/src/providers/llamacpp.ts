import { useApi } from 'restmix';
import { InferenceParams, InferenceResult, LmProvider, LmProviderParams, ModelConf } from "@locallm/types";

class LlamacppProvider implements LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  onToken?: (t: string) => void;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  // state
  model: ModelConf = { name: "", ctx: 2048 };
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
    if (params.apiKey.length > 0) {
      this.api.addHeader("Authorization", `Bearer ${params.apiKey}`);
    }
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
   * Loads a specified model for inferences. Note: it will query the server
   * and retrieve current model info (name and ctx).
   *
   * @async
   * @param {string} name - The name of the model to load.
   * @param {number | undefined} [ctx] - The optional context window length, defaults to the model ctx.
   * @param {string | undefined} [threads] - The number of threads to use for inference.
   * @param {gpu_layers | undefined} [gpu_layers] - The number of layers to offload to the GPU
   * @returns {Promise<void>}
   */
  async loadModel(name: string, ctx?: number, threads?: number, gpu_layers?: number): Promise<void> {
    const res = await this.api.post<Record<string, any>>("/completion", { prompt: "" });
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
      delete params.template;
    }
    let inferenceParams: Record<string, any> = params;
    inferenceParams.prompt = prompt;
    if ("max_tokens" in params) {
      inferenceParams.n_predict = params.max_tokens;
      delete inferenceParams.max_tokens;
    }
    if ("tfs" in params) {
      inferenceParams.tfs_z = params.tfs;
      delete inferenceParams.tfs;
    }
    if ("extra" in params) {
      inferenceParams = { ...inferenceParams, ...params.extra };
      delete inferenceParams.extra;
    }
    inferenceParams.template = undefined;
    inferenceParams.gpu_layers = undefined;
    inferenceParams.threads = undefined;

    let respData: InferenceResult = { text: "", stats: {} };
    let i = 0;
    if (inferenceParams?.stream == true) {
      const _onChunk = (payload: Record<string, any>) => {
        if (i == 0) {
          if (this.onStartEmit) {
            this.onStartEmit()
          }
        }
        //console.log("OT", typeof payload);
        //console.log(">>>>", payload, "<<<<")
        const pt = typeof payload;
        if (pt == "string") {
          // Fix for last 2 json payload
          const txt = payload.split('"stop":false}')[1];
          const data = JSON.parse(txt);
          respData.stats = data;
        } else {
          if (!payload.stop) {
            if (this.onToken) {
              const token = payload.content;
              this.onToken(token);
              respData.text += token
            }
          } else {
            //console.log("END", payload);
            respData.stats = payload;
          }
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
    //console.log("STATS", respData)
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