import type { ToolCallSpec } from "./tools.js";

/**
 * Represents a single turn in a conversation history.
 *
 * @interface HistoryTurn
 * @param {string | undefined} user - The user's message in this turn.
 * @param {string | undefined} assistant - The assistant's response in this turn.
 * @param {{ calls: Array<ToolCallSpec>, results: Array<{ id: string, content: string }> } | undefined} tools - Tool calls and results for this turn.
 * @example
 * const historyTurn: HistoryTurn = {
 *   user: "What's the weather like?",
 *   assistant: "The weather is sunny with a temperature of 72°F.",
 *   tools: {
 *     calls: [{ id: '1', name: 'getWeather', arguments: { location: 'New York' } }],
 *     results: [{ id: '1', content: 'Sunny, 72°F' }]
 *   }
 * };
 */
interface HistoryTurn {
    user?: string;
    assistant?: string;
    think?: string;
    images?: Array<ImgData>;
    tools?: Array<ToolTurn>;
}

interface ToolTurn {
    call: ToolCallSpec;
    response: any;
}

/**
 * Image data associated with a message or response.
 *
 * @interface ImgData
 * @typedef {ImgData}
 * 
 * @example
 * const imgExample: ImgData = {
 *   id: 1,
 *   data: 'base64image'
 * };
 */
interface ImgData {
    /**
     * Unique identifier for the image.
     */
    id: number;

    /**
     * Base64 encoded image data.
     */
    data: string;
}

export {
    HistoryTurn,
    ToolTurn,
    ImgData,
}
