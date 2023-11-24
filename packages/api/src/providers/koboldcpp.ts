import { useApi } from 'restmix';
import { InferenceParams, InferenceResult, LmProvider, LmProviderParams, ModelConf } from "../packages/types/interfaces.js";


class KoboldcppProvider implements LmProvider {
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
   * Loads a specified model for inferences. Note: it will query the server
   * and retrieve current model info (name and ctx). It is not needed as it
   * will be automatically managed when running inference because this provider
   * does not support multiple models
   *
   * @async
   * @param {string} name - The name of the model to load.
   * @param {number} [ctx] - The optional context window length.
   * @param {string} [template] - The name of the template to use with the model.
   * @param {gpu_layers} [gpu_layers] - The number of layers to offload to the GPU
   * @returns {Promise<void>}
   */
  async loadModel(name: string, ctx?: number, template?: string, gpu_layers?: number): Promise<void> {
    // load ctx
    const res = await this.api.get<{ value: number }>("/api/extra/true_max_context_length");
    if (res.ok) {
      //console.log("Setting model ctx to", res.data.value)
      this.model.ctx = res.data.value
    }
    // load model name
    const res2 = await this.api.get<{ result: string }>("/api/v1/model");
    if (res2.ok) {
      //console.log("R:", res.data)
      this.model.name = res2.data.result
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
    // autoload model
    if (this.model.name.length > 0) {
      await this.loadModel("")
    }
    this.abortController = new AbortController();
    if (params?.template) {
      prompt = params.template.replace("{prompt}", prompt);
    }
    const inferParams = {
      prompt: prompt,
      max_context_length: this.model.ctx,
      max_length: params.max_tokens,
      rep_pen: params.repeat_penalty,
      stop_sequence: params.stop,
      temperature: params.temperature,
      tfs: params.tfs,
      top_k: params.top_k,
      top_p: params.top_p,
      ...params.extra,
    };
    const body = JSON.stringify(inferParams);
    const url = `${this.serverUrl}/api/extra/generate/stream`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    if (!response.body) {
      throw new Error("No response body")
    }
    const reader = response.body.getReader();
    let text = '';
    let i = 1;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const raw = new TextDecoder().decode(value);
      //console.log("|begin|", `'${raw}'`, '|end|');
      if (raw.startsWith('{"results":')) {
        const data = JSON.parse(raw);
        text = data["results"][0]["text"];
        break
      } else {
        let data = "";
        if (raw.startsWith("event: message")) {
          if (raw.includes("data:")) {
            data = raw.replace("event: message\n", "");
          } else {
            continue
          }
        } else {
          data = raw
        }
        const t = data.replace("data: ", "")
          .slice(0, -2)
          .replace('{"token": "', "")
          .slice(0, -2)
          .replace('\\"', '"')
          .replace("\\n", "\n");
        if (i == 1) {
          if (this.onStartEmit) {
            this.onStartEmit();
          }
        }
        //console.log(t + "|end|")
        if (this.onToken) {
          this.onToken(t);
        }
        ++i
      }
    }

    return {
      text: text,
      stats: {
        totalTokens: i,
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
    this.abortController.abort();
    const res = await this.api.post("/api/extra/abort", { genKey: "" });
    console.log(res)
  }
}

export { KoboldcppProvider }