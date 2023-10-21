import { useApi } from "restmix";
import { InferenceParams, InferenceResult, LmDefaults, LmParams, LmProvider, LmProviderType, ModelConf } from "@locallm/types";
import { KoboldcppProvider } from './providers/koboldcpp.js';
import { GoinferProvider } from "./providers/goinfer/provider.js";
import { OllamaProvider } from "./providers/ollama.js";

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
  onStartEmit?: (data?: any) => void;
  onError?: (err: string) => void;
  modelsInfo: () => Promise<void>;
  loadModel: (name: string, ctx?: number, template?: string) => Promise<void>;
  infer: (prompt: string, params: InferenceParams) => Promise<InferenceResult>;
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
      case "koboldcpp":
        this.name = "Koboldcpp";
        this.provider = new KoboldcppProvider({
          name: "Koboldcpp",
          serverUrl: params.serverUrl,
          apiKey: "",
          onToken: params.onToken,
          onStartEmit: params.onStartEmit,
          onError: params.onError,
        });
        break;
      case "goinfer":
        this.name = "Goinfer";
        if (!params.apiKey) {
          throw new Error("Provide an api key")
        }
        this.provider = new GoinferProvider({
          name: "Goinfer",
          serverUrl: params.serverUrl,
          apiKey: params.apiKey,
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
          apiKey: "",
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