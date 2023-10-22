import { InferenceParams, InferenceResult, LmProvider, LmProviderParams, ModelConf } from "@locallm/types";
import { useApi } from "restmix";
import { loadModelFromConf } from "../utils.js";
import { ModelState, StreamedMessage, TempInferStats } from "./interfaces.js";

/**
 * Implements the language model provider for the Goinfer service.
 * This class allows for interactions with the Goinfer API to manage models,
 * perform inferences, and handle various related tasks.
 * 
 * @implements {LmProvider}
 */
class GoinferProvider implements LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  onToken?: (t: string) => void;
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  /** Current active model configuration */
  model: ModelConf = { name: "" };
  /** List of available model configurations */
  models = new Array<ModelConf>();
  apiKey: string;
  serverUrl: string;
  abortController = new AbortController();

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
    this.api = useApi({
      serverUrl: params.serverUrl,
    });
    this.api.addHeader("Authorization", `Bearer ${params.apiKey}`);
  }

  /**
   * Fetches and stores the list of available models from the Goinfer API.
   *
   * @async
   * @returns {Promise<void>}
   */
  async modelsInfo(): Promise<void> {
    const res = await this.api.get<ModelState>("/model/state");
    //console.log("RES", res.data);
    for (const [modelName, template] of Object.entries(res.data.models)) {
      this.models.push({
        name: modelName,
        ctx: template.ctx,
        template: template.name,
      });
    };
    if (res.data.isModelLoaded) {
      this.model = {
        name: res.data.loadedModel,
        ctx: res.data.ctx,
      }
      //console.log("Model loaded:", this.model)
    }
  }

  /**
   * Loads a specified model into memory for inferences.
   *
   * @async
   * @param {string} name - The name of the model to load.
   * @param {number} [ctx] - The optional context window length.
   * @param {string} [template] - The name of the template to use with the model.
   * @param {gpu_layers} [gpu_layers] - The number of layers to offload to the GPU
   * @returns {Promise<void>}
   */
  async loadModel(name: string, ctx?: number, template?: string, gpu_layers?: number): Promise<void> {
    const _model = loadModelFromConf(name, this.models, ctx, template, gpu_layers);
    const res = await this.api.post<{ error: string }>("/model/load", _model);
    if (res.ok) {
      if (res.status == 202) {
        // the model is already loaded
        console.warn("The model has already been loaded");
      }
    } else {
      throw new Error("Error loading the model: " + res.data.error)
    }
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
    this.abortController = new AbortController();
    const paramDefaults = {
      prompt: prompt,
      template: params.template,
      ...params,
    };
    const inferenceParams = { ...paramDefaults };
    let respData: InferenceResult = { text: "", stats: {} };
    if (inferenceParams?.stream == true) {
      const _onChunk = (payload: Record<string, any>) => {
        const msg: StreamedMessage = {
          num: payload["num"],
          type: payload["msg_type"],
          content: payload["content"],
          data: payload["data"] ?? {},
        }
        if (msg.type == "token") {
          //console.log("TOKEN", msg.content, onToken);
          if (this.onToken) {
            this.onToken(msg.content);
          }
        } else {
          if (msg.type == "system") {
            if (msg.content == "start_emitting") {
              if (this.onStartEmit) {
                this.onStartEmit(msg.data as TempInferStats)
              }
            } else if (msg.content == "result") {
              respData = msg.data as InferenceResult;
            }
          } else if (msg.type == "error") {
            if (this.onError) {
              this.onError(msg.content)
            } else {
              throw new Error(msg.content)
            }
          }
        }
      }

      await this.api.postSse<Record<string, any>>(
        "/completion",
        inferenceParams,
        _onChunk,
        this.abortController,
      )
    } else {
      const res = await this.api.post<Record<string, any> | StreamedMessage>("/completion", inferenceParams);
      //console.log("RES", res)
      if (res.ok) {
        const raw = res.data as Record<string, any>;
        respData.text = raw.text;
        respData.stats = raw.stats;
      } else {
        const msg = res.data as StreamedMessage;
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
  }
}

export { GoinferProvider };
