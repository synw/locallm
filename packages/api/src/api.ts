import { useApi } from "restmix";
import { InferenceParams, InferenceResult, IngestionStats, LmDefaults, LmParams, LmProvider, LmProviderType, ModelConf, OnLoadProgress } from "@locallm/types";
import { KoboldcppProvider } from './providers/koboldcpp.js';
import { OllamaProvider } from "./providers/ollama.js";
import { LlamacppProvider } from "./providers/llamacpp.js";

/**
 * Represents a Language Model (LM) which acts as a high-level interface to various underlying LM providers.
 * 
 * @class
 * @implements {LmProvider}
 */
class Lm implements LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  onToken?: (t: string) => void;
  onStartEmit?: (data: IngestionStats) => void;
  onEndEmit?: (result: InferenceResult) => void;
  onError?: (err: string) => void;
  modelsInfo: () => Promise<void>;
  info: () => Promise<Record<string, any>>;
  loadModel: (name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) => Promise<void>;
  infer: (prompt: string, params: InferenceParams, parseJson?: boolean, parseJsonFunc?: (data: string) => Record<string, any>) => Promise<InferenceResult>;
  abort: () => Promise<void>;
  models = new Array<ModelConf>();
  model: ModelConf = { name: "", ctx: 2048 };
  provider: LmProvider;
  providerType: LmProviderType;
  apiKey: string;
  serverUrl: string;
  defaults?: LmDefaults;

  /**
   * Constructs a new LM instance with the specified provider and parameters.
   * 
   * @param {LmParams} params - The parameters for initializing the LM.
   * @throws {Error} Throws an error if an unknown provider type is specified or if required parameters for a provider are missing.
   */
  constructor(params: LmParams) {
    this.providerType = params.providerType;
    switch (params.providerType) {
      case "llamacpp":
        this.name = "llamacpp";
        this.provider = new LlamacppProvider({
          name: "Llamacpp",
          serverUrl: params.serverUrl,
          apiKey: params.apiKey ?? "",
          onToken: params.onToken,
          onStartEmit: params.onStartEmit,
          onError: params.onError,
        });
        break;
      case "koboldcpp":
        this.name = "Koboldcpp";
        this.provider = new KoboldcppProvider({
          name: "Koboldcpp",
          serverUrl: params.serverUrl,
          apiKey: params.apiKey ?? "",
          onToken: params.onToken,
          onStartEmit: params.onStartEmit,
          onError: params.onError,
        });
        break;
      case "ollama":
        this.name = "Ollama";
        this.provider = new OllamaProvider({
          name: "Ollama",
          serverUrl: params.serverUrl,
          apiKey: params.apiKey ?? "",
          onToken: params.onToken,
          onStartEmit: params.onStartEmit,
          onError: params.onError,
        });
        break;
      default:
        throw new Error(`Unknown provider ${params.providerType}`)
    }
    this.api = this.provider.api;
    this.onToken = this.provider.onToken;
    this.onStartEmit = this.provider.onStartEmit;
    this.onError = this.provider.onError;
    this.modelsInfo = this.provider.modelsInfo;
    this.info = this.provider.info;
    this.loadModel = this.provider.loadModel;
    this.infer = this.provider.infer;
    this.abort = this.provider.abort;
    this.serverUrl = this.provider.serverUrl;
    this.apiKey = this.provider.apiKey;
    this.defaults = this.provider.defaults;
    this.models = this.provider.models;
  }
}


export { Lm }