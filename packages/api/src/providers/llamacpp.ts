import { useApi } from 'restmix';
import { type ParsedEvent } from 'eventsource-parser';
import { EventSourceParserStream } from 'eventsource-parser/stream';
import {
  InferenceOptions, InferenceParams, InferenceResult, InferenceStats, IngestionStats, LmProvider, LmProviderParams, ModelConf, OnLoadProgress
} from "@locallm/types";
import { useStats } from '../stats.js';

class LlamacppProvider implements LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  onToken?: (t: string) => void;
  onStartEmit?: (data: IngestionStats) => void;
  onEndEmit?: (result: InferenceResult) => void;
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
    this.onEndEmit = params.onEndEmit;
    this.onError = params.onError;
    if (params?.apiKey) {
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
    this.apiKey = params.apiKey ?? "";
    this.serverUrl = params.serverUrl;
  }

  /**
   * Not implemented for this provider
   *
   * @returns {Promise<void>}
   */
  async modelsInfo(): Promise<void> {
    console.warn("Not implemented for this provider")
  }

  async info(): Promise<Record<string, any>> {
    const res = await this.api.get<Record<string, any>>("/props");
    if (res.ok) {
      //console.log("RES", res.data)
      this.model.ctx = res.data.default_generation_settings.n_ctx;
      this.model.name = res.data.model_path.split("/").pop();
    }
    return this.model
  }

  /**
   * Loads a specified model for inferences. Note: it will query the server
   * and retrieve current model info (name and ctx).
   *
   * @param {string} name - The name of the model to load.
   * @param {number | undefined} [ctx] - The optional context window length, defaults to the model ctx.
   * @returns {Promise<void>}
   */
  async loadModel(name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress): Promise<void> {
    throw new Error("Not implemented for this provider");
  }

  /**
   * Makes an inference based on the provided prompt and parameters.
   *
   * @param {string} prompt - The input text to base the inference on.
   * @param {InferenceParams} params - Parameters for customizing the inference behavior.
   * @returns {Promise<InferenceResult>} - The result of the inference.
   */
  async infer(
    prompt: string,
    params: InferenceParams,
    options?: InferenceOptions,
  ): Promise<InferenceResult> {
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

    const body = JSON.stringify(inferenceParams);
    //console.log("KBPARAMS", body);
    const url = `${this.serverUrl}/completion`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };
    if (this.apiKey.length > 0) {
      headers["Authorization"] = `Bearer ${this.apiKey}`
    }

    let text = "";
    const stats = useStats();
    stats.start();
    let finalStats = {} as InferenceStats;
    let serverStats: Record<string, any> = {};
    if (inferenceParams?.stream == true) {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
        signal: this.abortController.signal,
      });
      if (!response.body) {
        throw new Error("No response body")
      }
      let buf = new Array<string>();
      const eventStream = response.body // @ts-ignore
        .pipeThrough(new TextDecoderStream()) // @ts-ignore
        .pipeThrough(new EventSourceParserStream())
        .getReader()
      let i = 1;
      while (true) {
        const { done, value } = await eventStream.read()
        if (!done) {
          if (i == 1) {
            const ins = stats.inferenceStarts();
            if (this.onStartEmit) {
              this.onStartEmit(ins)
            }
          }
          if (this.onToken) {
            const payload = JSON.parse((value as ParsedEvent).data);
            const t = payload["content"];
            this.onToken(t);
            buf.push(t);
            /*if (payload.stop) {
              //console.log(JSON.stringify(payload, null, "  "));
            }*/
          }
          ++i
          continue
        } else {
          break
        }
      }
      text = buf.join("");
      finalStats = stats.inferenceEnds(i);
    } else {
      const res = await this.api.post<Record<string, any>>("/completion", inferenceParams);
      //console.log("RES", res)
      if (res.ok) {
        const raw = res.data as Record<string, any>;
        text = raw.content;
        delete raw.content;
        serverStats = raw;
      } else {
        const msg = res.data;
        throw new Error(`${res.statusText} ${msg.content}`);
      }
    }
    const ir: InferenceResult = {
      text: text,
      stats: finalStats,
      serverStats: serverStats,
    };
    if (this.onEndEmit) {
      this.onEndEmit(ir)
    }
    return ir
  }

  /**
   * Aborts a currently running inference task.
   *
   * @returns {Promise<void>}
   */
  async abort(): Promise<void> {
    this.abortController.abort();
    //const res = await this.api.post("/api/extra/abort", { genKey: "" });
    //console.log(res)
  }
}

export { LlamacppProvider }