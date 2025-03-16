import { useApi } from 'restmix';
import { InferenceParams, InferenceResult, IngestionStats, LmProvider, LmProviderParams, LmProviderType, ModelConf, OnLoadProgress, BasicOnLoadProgress, } from "@locallm/types";
import { parseJson as parseJsonUtil, useStats } from '@locallm/api';
import { AssetsPathConfig, ChatCompletionOptions, SamplingConfig, Wllama } from '@wllama/wllama/esm/index.js';
import { LmBrowserProviderParams } from './interfaces.js';

const wllamaSingle = 'single-thread/wllama.wasm';
const wllamaMulti = 'multi-thread/wllama.wasm';

class WllamaProvider implements LmProvider {
    name: string;
    api = useApi();
    onToken?: (t: string) => void;
    onStartEmit?: (data: IngestionStats) => void;
    onEndEmit?: (result: InferenceResult) => void;
    onError?: (err: string) => void;
    providerType: LmProviderType = "browser";
    // state
    model: ModelConf = { name: "", ctx: 2048 };
    models = new Array<ModelConf>();
    //abortController = new AbortController();
    apiKey: string;
    serverUrl: string;
    // state
    abortInference = false;
    wllama = new Wllama({
        'single-thread/wllama.wasm': "/esm/" + wllamaSingle,
        'multi-thread/wllama.wasm': "/esm/" + wllamaMulti,
    });

    constructor(params: LmProviderParams) {
        this.name = params.name;
        this.onToken = params.onToken;
        this.onStartEmit = params.onStartEmit;
        this.onError = params.onError;
        this.onEndEmit = params.onEndEmit;
        this.apiKey = params.apiKey ?? "";
        this.serverUrl = params.serverUrl;
    }

    static init(params: LmBrowserProviderParams, config: string | AssetsPathConfig = "/esm/"): WllamaProvider {
        let conf: AssetsPathConfig;
        if (typeof config == "string") {
            conf = {
                'single-thread/wllama.wasm': config + wllamaSingle,
                'multi-thread/wllama.wasm': config + wllamaMulti,
            };
        } else {
            conf = config
        }
        const provider = new WllamaProvider({
            serverUrl: "",
            apiKey: "",
            ...params,
        });
        provider.wllama = new Wllama(conf);
        return provider
    }

    /**
    * Set the available models from the browser cache
    *
    * @returns {Promise<void>}
    */
    async modelsInfo(): Promise<void> {
        const cachedFiles = (await this.wllama.cacheManager.list()).filter((m) => {
            return m.size === m.metadata.originalSize;
        });
        const cachedURLs = new Set(cachedFiles.map((e) => e.metadata.originalURL));
        const models = new Set<ModelConf>();
        cachedURLs.forEach((u) => {
            const name = u
                .split('/')
                .pop()
                ?.replace(/-\d{5}-of-\d{5}/, '')
                .replace('.gguf', '') ?? '(unknown)';
            models.add({
                name: name,
                ctx: -1
            })
        })
        this.models = Array.from(models);
    }

    async info(): Promise<Record<string, any>> {
        if (!this.wllama.isModelLoaded()) {
            throw new Error("The model is not loaded");
        }
        return this.wllama.getModelMetadata()
    }

    async loadModel(name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) {
        if (!urls) {
            throw new Error("Provide urls to load a browser models")
        }
        const progressCallback: BasicOnLoadProgress = (p) => {
            const progressPercentage = Math.round((p.loaded / p.total) * 100);
            const data = { ...p, percent: progressPercentage };
            if (onLoadProgress) {
                onLoadProgress(data);
            }
        };
        await this.wllama.loadModelFromUrl(urls, {
            progressCallback: progressCallback,
            n_ctx: ctx ?? -1,
        });
        this.model.name = name;
        this.model.ctx = ctx ?? -1;
        this.model.extra = { urls: urls };
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
        parseJson = false,
        parseJsonFunc?: (data: string) => Record<string, any>
    ): Promise<InferenceResult> {
        if (!this.wllama.isModelLoaded()) {
            throw new Error("No model loaded")
        }
        this.abortInference = false;
        let _prompt = prompt;
        if (params?.template) {
            _prompt = params.template.replace("{prompt}", prompt);
            delete params.template;
        }
        const options: ChatCompletionOptions & { stream?: false | undefined; } = {};
        let samplingOptions: SamplingConfig = {};
        if ("max_tokens" in params) {
            options.nPredict = params.max_tokens;
        }
        if ("stop" in params) {
            let st = new Array<number>();
            for (const t of (params?.stop ?? [])) {
                st = [...st, ...(await this.wllama.tokenize(t))]
            }
            options.stopTokens = st;
        }
        if ("temperature" in params) {
            samplingOptions.temp = params.temperature;
        }
        if ("top_k" in params) {
            samplingOptions.top_k = params.top_k;
        }
        if ("top_p" in params) {
            samplingOptions.top_p = params.top_p;
        }
        if ("min_p" in params) {
            samplingOptions.min_p = params.min_p;
        }
        if ("repeat_penalty" in params) {
            samplingOptions.penalty_repeat = params.repeat_penalty;
        }
        if ("grammar" in params) {
            samplingOptions.grammar = params.grammar;
        }
        if ("extra" in params) {
            samplingOptions = { ...samplingOptions, ...params.extra }
        }
        options.sampling = samplingOptions;
        let i = 1;
        const decoder = new TextDecoder('utf-8');
        options.onNewToken = (token, piece, currentText, { abortSignal }) => {
            if (i == 1) {
                const ins = stats.inferenceStarts();
                if (this.onStartEmit) {
                    this.onStartEmit(ins)
                }
            }
            if (this.onToken) {
                const t = decoder.decode(piece);
                this.onToken(t);
            }
            if (this.abortInference) {
                abortSignal()
            }
            ++i
        };
        const stats = useStats();
        stats.start();
        //console.log(_prompt);
        const txt = await this.wllama.createCompletion(_prompt, options);
        const finalStats = stats.inferenceEnds(i);
        let data: Record<string, any> = {};
        if (parseJson) {
            data = parseJsonUtil(txt, parseJsonFunc);
        }
        const res: InferenceResult = {
            text: txt,
            data: data,
            stats: finalStats,
            serverStats: {},
        };
        if (this.onEndEmit) {
            this.onEndEmit(res)
        }
        return res
    }
    /**
 * Aborts a currently running inference task.
 *
 * @returns {Promise<void>}
 */
    async abort(): Promise<void> {
        this.abortInference = true;
    }
}

export { WllamaProvider }
