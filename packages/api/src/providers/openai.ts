import { InferenceParams, InferenceResult, InferenceStats, IngestionStats, LmProvider, LmProviderParams, ModelConf, OnLoadProgress } from "@locallm/types";
import { useApi } from "restmix";
import OpenAI from "openai"
import { useStats } from "../stats.js";
import { parseJson as parseJsonUtil } from './utils.js';
import { ChatCompletionMessageParam } from "openai/resources/index.js";

class OpenaiCompatibleProvider implements LmProvider {
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
    openai: OpenAI;

    /**
 * Creates a new instance of the OpenaicppProvider.
 *
 * @param {LmProviderParams} params - Configuration parameters for initializing the provider.
 */
    constructor(params: LmProviderParams) {
        this.name = params.name;
        this.onToken = params.onToken;
        this.onStartEmit = params.onStartEmit;
        this.onEndEmit = params.onEndEmit;
        this.onError = params.onError;
        this.apiKey = params.apiKey ?? "";
        this.serverUrl = params.serverUrl;
        this.openai = new OpenAI({
            apiKey: this.apiKey ?? "",
            baseURL: this.serverUrl,
        })
        this.api = useApi({
            serverUrl: params.serverUrl,
            credentials: "omit",
        });
    }

    /**
   * Not implemented for this provider
   *
   * @returns {Promise<void>}
   */
    async modelsInfo(): Promise<void> {
        const res = await this.api.get<Record<string, any>>("/v1/models");
        if (res.ok) {
            (res.data.data as Array<Record<string, any>>).forEach(row => this.models.push({ name: row.id, ctx: -1 }))
        }
    }

    async info(): Promise<Record<string, any>> {
        console.warn("Not implemented for this provider")
        return {}
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
        this.model = { name: name, ctx: ctx }
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
        this.abortController = new AbortController();
        let inferenceParams: Record<string, any> = params;
        if ("max_tokens" in params) {
            inferenceParams.max_completion_tokens = params.max_tokens;
            delete inferenceParams.max_tokens;
        }
        if ("model" in inferenceParams) {
            this.model = inferenceParams.model;
            delete inferenceParams.model;
        }
        inferenceParams.stream = params.stream ?? true;
        inferenceParams.template = undefined;
        inferenceParams.gpu_layers = undefined;
        inferenceParams.threads = undefined;
        const stats = useStats();
        stats.start();
        let finalStats = {} as InferenceStats;
        let serverStats: Record<string, any> = {};
        let text: string;
        const msgs: Array<ChatCompletionMessageParam> = params?.extra?.system ?
            [{ role: "system", content: params.extra.system }]
            : [];
        if (params?.extra?.history) {
            (params.extra.history as Array<{ user: string, assistant: string }>).forEach(
                row => {
                    msgs.push({
                        role: "user",
                        content: row.user,
                    });
                    msgs.push({
                        role: "assistant",
                        content: row.assistant,
                    });
                }
            );
        }
        msgs.push({ role: "user", content: prompt });
        if (params?.extra) {
            if (params.extra?.system) {
                delete params.extra.system
            }
            if (params.extra?.history) {
                delete params.extra.history
            }
            inferenceParams = { ...inferenceParams, ...params.extra };
            delete inferenceParams.extra;
        }
        /*console.log("Model", this.model.name);
        console.log("IP", JSON.stringify(inferenceParams));
        console.log("MSGS", msgs);*/
        let i = 1;
        if (!params.stream) {
            const completion = await this.openai.chat.completions.create({
                messages: msgs,
                model: this.model.name,
                ...inferenceParams,
            });
            text = completion.choices[0].message.content ?? "";
            i = text.length;
            serverStats = completion?.usage ?? {};
        } else {
            const completion = this.openai.chat.completions.stream({
                messages: [{ role: "user", content: prompt }],
                model: this.model.name,
                ...inferenceParams,
                signal: this.abortController.signal,
            });
            let buf = new Array<string>();
            if (this.onToken) {
                for await (const part of completion) {
                    const t = part.choices[0]?.delta?.content || "";
                    this.onToken(t);
                    buf.push(t);
                    ++i
                }
            }
            text = buf.join("");
        }
        finalStats = stats.inferenceEnds(i);
        let data = {};
        if (parseJson) {
            data = parseJsonUtil(text, parseJsonFunc);
        }
        const ir: InferenceResult = {
            text: text,
            data: data,
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

export {
    OpenaiCompatibleProvider,
}