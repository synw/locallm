import { useApi } from 'restmix';
import { InferenceParams, InferenceResult, IngestionStats, LmProvider, LmProviderParams, LmProviderType, ModelConf } from "@locallm/types";
import { parseJson as parseJsonUtil, useStats } from '@locallm/api';
import { ChatCompletionOptions, SamplingConfig, Wllama } from '@wllama/wllama/esm/wllama';
import { BasicOnLoadProgress, LmBrowserProviderParams, OnLoadProgress } from './interfaces';

const CONFIG_PATHS = {
    'single-thread/wllama.js': './esm/single-thread/wllama.js',
    'single-thread/wllama.wasm': './esm/single-thread/wllama.wasm',
    'multi-thread/wllama.js': './esm/multi-thread/wllama.js',
    'multi-thread/wllama.wasm': './esm/multi-thread/wllama.wasm',
    'multi-thread/wllama.worker.mjs': './esm/multi-thread/wllama.worker.mjs',
};
const wllama = new Wllama(CONFIG_PATHS);

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

    constructor(params: LmProviderParams) {
        this.name = params.name;
        this.onToken = params.onToken;
        this.onStartEmit = params.onStartEmit;
        this.onError = params.onError;
        this.apiKey = params.apiKey ?? "";
        this.serverUrl = params.serverUrl;
    }

    static init(params: LmBrowserProviderParams): WllamaProvider {
        return new WllamaProvider({
            serverUrl: "",
            apiKey: "",
            ...params,
        })
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

    async info(): Promise<Record<string, any>> {
        if (!wllama.isModelLoaded()) {
            throw new Error("The model is not loaded");
        }
        return wllama.getModelMetadata()
    }

    async loadModel(name: string, ctx?: number, threads?: number, gpu_layers?: number): Promise<void> {
        throw new Error("Not implemented for this provider: use loadBrowserModel");
    }

    async loadBrowsermodel(name: string, urls: string | string[], ctx: number, onLoadProgress: OnLoadProgress) {
        const progressCallback: BasicOnLoadProgress = (p) => {
            const progressPercentage = Math.round((p.loaded / p.total) * 100);
            const data = { ...p, percent: progressPercentage };
            onLoadProgress(data);
        };
        await wllama.loadModelFromUrl(urls, {
            progressCallback: progressCallback,
            n_ctx: ctx,
        });
        this.model.name = name;
        this.model.ctx = ctx;
    }

    /**
 * Makes an inference based on the provided prompt and parameters.
 *
 * @async
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
        if (!wllama.isModelLoaded()) {
            throw new Error("No model loaded")
        }
        this.abortInference = false;
        let _prompt = prompt;
        if (params?.template) {
            _prompt = params.template.replace("{prompt}", prompt);
            delete params.template;
        }
        const options: ChatCompletionOptions = {};
        let samplingOptions: SamplingConfig = {};
        if ("max_tokens" in params) {
            options.nPredict = params.max_tokens;
        }
        if ("stop" in params) {
            let st = new Array<number>();
            for (const t of (params?.stop ?? [])) {
                st = [...st, ...(await wllama.tokenize(t))]
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
        if ("tfs" in params) {
            samplingOptions.tfs_z = params.tfs;
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
        let i = 1;
        options.onNewToken = (token, piece, currentText, { abortSignal }) => {
            if (i == 1) {
                const ins = stats.inferenceStarts();
                if (this.onStartEmit) {
                    this.onStartEmit(ins)
                }
            }
            if (this.onToken) {
                this.onToken(currentText);
            }
            if (this.abortInference) {
                abortSignal()
            }
            ++i
        };
        const stats = useStats();
        stats.start();
        console.log(_prompt);
        const txt = await wllama.createCompletion(_prompt, options);
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
 * @async
 * @returns {Promise<void>}
 */
    async abort(): Promise<void> {
        this.abortInference = true;
    }
}

export { WllamaProvider }
