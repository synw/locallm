import { useApi } from 'restmix';
import { InferenceParams, InferenceResult, LmProvider, LmProviderParams, ModelConf } from "@locallm/types";

class KoboldcppProvider implements LmProvider {
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
    if (params.apiKey.length > 0) {
      this.api = useApi({
        serverUrl: params.serverUrl,
        credentials: "include",
      });
      this.api.addHeader("Authorization", `Bearer ${params.apiKey}`);
    } else {
      this.api = useApi({
        serverUrl: params.serverUrl,
        credentials: "omit",
      });
    }
    this.apiKey = params.apiKey;
    this.serverUrl = params.serverUrl;
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
      delete params.template;
    }
    let inferenceParams: Record<string, any> = params;
    inferenceParams.prompt = prompt;
    inferenceParams.max_context_length = this.model.ctx;
    if ("max_tokens" in params) {
      inferenceParams.max_length = params.max_tokens;
      delete inferenceParams.max_tokens;
    }
    if ("repeat_penalty" in params) {
      inferenceParams.rep_pen = params.repeat_penalty;
      delete inferenceParams.repeat_penalty;
    }
    if ("stop" in params) {
      inferenceParams.stop_sequence = params.stop;
      delete inferenceParams.stop;
    }
    if ("extra" in params) {
      inferenceParams = { ...inferenceParams, ...params.extra };
      delete inferenceParams.extra;
    }
    inferenceParams.template = undefined;
    inferenceParams.gpu_layers = undefined;
    inferenceParams.threads = undefined;
    const body = JSON.stringify(inferenceParams);
    const url = `${this.serverUrl}/api/extra/generate/stream`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: body,
    });

    if (!response.body) {
      throw new Error("No response body")
    }
    let i = 1;
    let text = '';
    if (inferenceParams?.stream == true) {

      const buf = new Array<string>();
      const reader = response.body.getReader();
      while (true) {
        if (i == 1) {
          if (this.onStartEmit) {
            this.onStartEmit();
          }
        }
        const { done, value } = await reader.read();
        if (done) break;
        const decoder = new TextDecoder();
        const data = decoder.decode(value);
        //console.log("DATA", data);

        const raw = data.replace("event: message\n", "").replace(/data: /, "");
        //console.log("RAW", raw);
        let t = "";
        try {
          t = JSON.parse(raw).token;
        } catch (e) {
          throw new Error(`Parsing error: ${e}`)
        }
        //const regex = /"token"\s*:\s*"([^"]*)"/;
        //const regex = /"token"\s*:\s*"((?:[^"\n]|\\n)*?)"/;
        //const match = data.match(regex);

        /*if (match === null) {
          throw new Error("null token")
        }
        const t = match[1].replace("\\n", "\n").replace("\\t", "\t");*/
        buf.push(t);
        if (this.onToken) {
          //console.log("T", t);
          this.onToken(t);
        }
      }
      text = buf.join("")
    } else {
      const res = await this.api.post<Record<string, any>>("/v1/generate", inferenceParams);
      if (res.ok) {
        text = res.data.results[0].text
      } else {
        throw new Error(`Error ${res.status} posting inference query ${res.data}`)
      }
    }
    return {
      text: text,
      stats: {}
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