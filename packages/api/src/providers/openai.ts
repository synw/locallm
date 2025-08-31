import type {
    InferenceOptions, InferenceParams, InferenceResult, InferenceStats, IngestionStats, LmProvider, LmProviderParams, ModelConf, OnLoadProgress, ToolCallSpec, ToolSpec
} from "@locallm/types";
import { useApi } from "restmix";
import OpenAI from "openai"
import { useStats } from "../stats.js";
import { convertToolCallSpec, generateId } from './utils.js';
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionCreateParamsStreaming, ChatCompletionMessageFunctionToolCall, ChatCompletionMessageParam, ChatCompletionMessageToolCall, ChatCompletionTool } from "openai/resources/index.js";
import { RequestOptions } from "openai/internal/request-options.js";

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
    tools: Record<string, ToolSpec> = {};

    /**
 * Creates a new instance of the OpenaiCompatibleProvider.
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
   * Use a specified model for inferences.
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
        options?: InferenceOptions,
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
        let msgs: Array<ChatCompletionMessageParam> = [];
        if (options?.system) {
            msgs = [{ role: "system", content: options.system }];
        }
        if (options?.history) {
            options.history.forEach(
                row => {
                    if (row?.user) {
                        msgs.push({
                            role: "user",
                            content: row.user,
                        });
                    }
                    if (row?.assistant) {
                        msgs.push({
                            role: "assistant",
                            content: row.assistant,
                        });
                    }
                    if (row?.tools) {
                        const toolCalls = new Array<ChatCompletionMessageToolCall>();
                        row.tools.calls.forEach(tc => toolCalls.push({
                            id: tc.id ?? "",
                            type: "function",
                            "function": {
                                name: tc.name,
                                arguments: JSON.stringify(tc.arguments)
                            }
                        }));
                        msgs.push({
                            role: "assistant",
                            content: null,
                            tool_calls: toolCalls,
                        })
                        for (const tr of row.tools.results) {
                            msgs.push({
                                role: "tool",
                                tool_call_id: tr.id,
                                content: tr.content,
                            })
                        }
                    }
                }
            );
        }
        if (prompt != " ") {
            msgs.push({ role: "user", content: prompt });
        }
        if (options?.debug) {
            console.log("MSGS ----------\n");
            console.log(msgs);
            console.log("---------------");
        }
        let tools: Array<ChatCompletionTool> = [];
        this.tools = {};
        if (options?.tools) {
            options.tools.forEach(t => {
                this.tools[t.name] = t;
                tools.push(convertToolCallSpec(t));
            });
        }
        if (options?.assistant) {
            msgs.push({ role: "assistant", content: options.assistant });
        }
        if (params?.extra) {
            inferenceParams = { ...inferenceParams, ...params.extra };
            delete inferenceParams.extra;
        }
        /*console.log("Model", this.model.name);
        console.log("IP", JSON.stringify(inferenceParams));
        console.log("MSGS", msgs);*/
        const toolCalls = new Array<ToolCallSpec>();
        let i = 1;
        if (!params.stream) {
            const ip: ChatCompletionCreateParamsNonStreaming = {
                messages: msgs,
                model: this.model.name,
                parallel_tool_calls: true,
                ...inferenceParams,
            };
            if (tools.length > 0) {
                ip.tools = tools
            }
            //console.log("IP", JSON.stringify(ip, null, 2));
            const completion = await this.openai.chat.completions.create(ip);
            //console.log("RESP", JSON.stringify(completion, null, "  "));
            text = completion.choices[0].message.content ?? "";
            i = text.length > 0 ? text.length : (completion.usage?.completion_tokens ?? 0);
            serverStats = completion?.usage ?? {};
            if (completion.choices[0].finish_reason == "tool_calls") {
                const tcs = completion.choices[0].message.tool_calls ?? [];
                tcs?.forEach(_tc => {
                    const tc = _tc as ChatCompletionMessageFunctionToolCall;
                    const toolCall: ToolCallSpec = {
                        id: tc.id ?? generateId(),
                        name: tc.function.name,
                    }
                    if (tc?.function?.arguments) {
                        try {
                            const parsedTc = JSON.parse(tc.function.arguments);
                            toolCall.arguments = parsedTc
                        } catch (e) {
                            throw new Error(`${e}\n\nTool call arguments parsing error: \n${tc.function.arguments}`)
                        }
                    }
                    toolCalls.push(toolCall)
                });
            }
        } else {
            const ip: ChatCompletionCreateParamsStreaming = {
                messages: msgs,
                model: this.model.name,
                parallel_tool_calls: true,
                ...inferenceParams,
                stream: true,
            };
            if (tools.length > 0) {
                ip.tools = tools
            }
            const opts: RequestOptions = {
                signal: this.abortController.signal,
            }
            //console.log("IP", JSON.stringify(ip, null, 2));
            const completion = this.openai.chat.completions.stream(ip, opts);
            //console.log("RESP", JSON.stringify(completion, null, "  "));
            let buf = new Array<string>();
            if (this.onToken) {
                if (i == 0) {
                    const ins = stats.inferenceStarts();
                    if (this.onStartEmit) {
                        this.onStartEmit(ins)
                    }
                }
                const modelRawToolCalls: Record<string, { id: string, arguments: Array<string> }> = {};
                let currentToolCallName = "";
                for await (const part of completion) {
                    //console.log("PART");
                    //console.dir(part, { depth: 8 });
                    if (part.choices[0]?.delta?.tool_calls) {
                        if (part.choices[0].delta.tool_calls[0]?.function?.name) {
                            const tcName = part.choices[0].delta.tool_calls[0].function.name;
                            if (!(tcName in modelRawToolCalls)) {
                                modelRawToolCalls[tcName] = { id: "", arguments: new Array<string>() };
                                currentToolCallName = tcName;
                            }
                        }
                        if (part.choices[0].delta.tool_calls[0]?.id) {
                            const tcId = part.choices[0].delta.tool_calls[0].id;
                            modelRawToolCalls[currentToolCallName].id = tcId;
                        }
                        if (part.choices[0].delta.tool_calls[0]?.function?.arguments) {
                            const strArg = part.choices[0].delta.tool_calls[0].function.arguments;
                            modelRawToolCalls[currentToolCallName].arguments.push(strArg);
                        }
                    }
                    const t = part.choices[0]?.delta?.content;
                    if (t) {
                        //console.log("T", JSON.stringify(t, null, "  "), "///", JSON.stringify(part, null, "  "));
                        this.onToken(t);
                        buf.push(t);
                    }
                    ++i
                }
                for (const [k, v] of Object.entries(modelRawToolCalls)) {
                    const args = JSON.parse(v.arguments.join(""));
                    const toolCall: ToolCallSpec = {
                        id: v.id ?? generateId(),
                        name: k,
                        arguments: args,
                    }
                    toolCalls.push(toolCall)
                }
            }
            text = buf.join("");
        }
        finalStats = stats.inferenceEnds(i);
        const ir: InferenceResult = {
            text: text,
            stats: finalStats,
            serverStats: serverStats,
        };
        if (toolCalls.length > 0) {
            ir.toolCalls = toolCalls
        }
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
    }
}

export {
    OpenaiCompatibleProvider,
}