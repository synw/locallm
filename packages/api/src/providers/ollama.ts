import { useApi } from "restmix";
import { InferenceParams, InferenceResult, LmProvider, LmProviderParams, ModelConf } from "@locallm/types";


class OllamaProvider implements LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  onToken?: (t: string) => void;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  // state
  model: ModelConf = { name: "", ctx: 2048 };
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
      credentials: "omit",
    });
    if (params.apiKey.length > 0) {
      this.api.addHeader("Authorization", `Bearer ${params.apiKey}`);
    }
  }

  /**
   * Load the models list
   *
   * @async
   * @returns {Promise<void>}
   */
  async modelsInfo(): Promise<void> {
    const res = await this.api.get<Record<string, any>>("/api/tags");
    if (res.ok) {
      //console.log("RES", res.data);
      for (const m of res.data["models"]) {
        this.models.push({ name: m.name, ctx: 2048 });
      }
    } else {
      throw new Error(`Error ${res.status} loading models ${res.text}`);
    }
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
    //this.model = loadModelFromConf(name, this.models, ctx, template)
    const res = await this.api.post<Record<string, any>>("/api/show", { name: name });
    if (res.ok) {
      let _ctx = ctx ?? 0;
      let _gpu_layers = gpu_layers;
      let _num_thread = threads;
      //console.log("RES", res.data);
      if ("parameters" in res.data) {
        for (const line of res.data["parameters"].split("\n")) {
          //console.log("LINE", line);
          if (line.startsWith("num_ctx")) {
            if (!ctx) {
              _ctx = parseInt(line.replace(/\D/g, ""));
            }
          }
          if (line.startsWith("num_gpu")) {
            if (!gpu_layers) {
              _gpu_layers = parseInt(line.replace(/\D/g, ""));
            }
          }
          if (line.startsWith("num_thread")) {
            if (!threads) {
              _num_thread = parseInt(line.replace(/\D/g, ""));
            }
          }
        }
      }
      if (_ctx == 0) {
        console.log("Context window size not available from Modelfile, using 2048");
        _ctx = 2048;
      }
      const model: ModelConf = { name: name, ctx: _ctx };
      if (_gpu_layers) {
        model.gpu_layers = _gpu_layers
      }
      if (_num_thread) {
        model.threads = _num_thread
      }
      //console.log("MOD", model);
      this.model = model;
    } else {
      throw new Error(`Error ${res.status} loading models ${res.text}`);
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
    if (this.model.name == "") {
      throw new Error("Load a model first, using the loadModel method");
    }
    this.abortController = new AbortController();
    let raw = false;
    if (params.extra?.raw) {
      raw = params.extra.raw;
      delete params.extra.raw;
    }
    let inferParams: Record<string, any> = {
      model: this.model.name,
      prompt: prompt,
      stream: params.stream,
      raw: raw,
      options: {
        num_ctx: this.model.ctx,
      },
      ...params.extra
    }
    if (params.threads) {
      inferParams.options.num_thread = params.threads;
    }
    if (params.gpu_layers) {
      inferParams.options.gpu_layers = params.gpu_layers;
    }
    if (params.repeat_penalty) {
      inferParams.options.repeat_penalty = params.repeat_penalty;
    }
    if (params.stop && params.stop.length > 0) {
      inferParams.options.stop = params.stop;
    }
    if (params.temperature) {
      inferParams.options.temperature = params.temperature;
    }
    if (params.tfs) {
      inferParams.options.tfs_z = params.tfs;
    }
    if (params.top_k) {
      inferParams.options.top_k = params.top_k;
    }
    if (params.top_p) {
      inferParams.options.top_p = params.top_p;
    }
    if (params.max_tokens) {
      inferParams.options.num_predict = params.max_tokens;
    }
    if (params.extra?.format) {
      inferParams["format"] = params.extra.format;
      delete params.extra.format
    }
    // Spread any additional properties from params.extra if it exists and is not empty
    if (params.extra && Object.keys(params.extra).length > 0) {
      inferParams = { ...inferParams, ...params.extra };
    }
    //console.log("Params", inferParams);
    let text = "";
    if (inferParams?.stream == true) {
      const body = JSON.stringify(inferParams);
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
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const raw = new TextDecoder().decode(value);
        const d = JSON.parse(raw);
        if (d["done"]) {
          break
        }
        const t = d["response"];
        buf.push(t);
        if (this.onToken) {
          this.onToken(t);
        }
      }
      text = buf.join("")
    } else {
      const res = await this.api.post<Record<string, any>>("/api/generate", inferParams);
      if (res.ok) {
        text = res.data.response
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
    this.abortController.abort()
  }
}

export { OllamaProvider }