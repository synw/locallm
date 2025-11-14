/**
 * Represents the configuration of a model.
 *
 * @interface ModelConf
 * @property {string} name - The unique name of the model.
 * @property {number | undefined} ctx - The context window length, typically used to define how much of the previous data to consider.
 * @property {{ size: string, quant: string } | undefined} info - Some meta info about the model: parameter size and quantization level
 * @property {Record<string, any> | undefined} extra - Extra parameters like urls for browser models
 * @example
 * const modelConf: ModelConf = {
 *   name: 'gpt-3',
 *   ctx: 2048,
 *   info: { size: '175B', quant: 'q4_0' },
 *   extra: { url: 'http://example.com/model' }
 * };
 */
interface ModelConf {
    name: string;
    ctx?: number;
    info?: { size: string, quant: string };
    extra?: Record<string, any>;
}

/**
 * Template information for model.
 *
 * @interface ModelTemplate
 * @property {string} name - The name of the template.
 * @property {number} ctx - The context window size for the model.
 * @example
 * const modelTemplate: ModelTemplate = {
 *   name: 'default_template',
 *   ctx: 2048
 * };
 */
interface ModelTemplate {
    name: string;
    ctx: number;
}

/**
 * Represents the state of the available models on server.
 *
 * @interface ModelState
 * @property {Record<string, ModelTemplate>} models - The models info object (name, template name, context window size).
 * @property {boolean} isModelLoaded - Indicates whether a model is loaded or not.
 * @property {string} loadedModel - The loaded model name, empty if no model is loaded.
 * @property {number} ctx - The loaded model context window size, 0 if no model is loaded.
 * @example
 * const modelState: ModelState = {
 *   models: { gpt3: { name: 'gpt-3', ctx: 2048 } },
 *   isModelLoaded: true,
 *   loadedModel: 'gpt-3',
 *   ctx: 2048
 * };
 */
interface ModelState {
    models: Record<string, ModelTemplate>;
    isModelLoaded: boolean;
    loadedModel: string;
    ctx: number;
}

export {
    ModelConf,
    ModelTemplate,
    ModelState,
}
