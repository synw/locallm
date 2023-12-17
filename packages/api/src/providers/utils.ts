import { ModelConf } from "@locallm/types";

/**
 * Fetches a model configuration based on its name, and then fills in missing
 * properties (if any) with the given default values or from the found model configuration.
 * 
 * @function
 * @param {string} name - The name of the model to load its configuration.
 * @param {Array<ModelConf>} models - List of available model configurations.
 * @param {number} [ctx] - Default context to be used if not provided in the found model configuration.
 * @param {string} [template] - Default template string to be used if not provided in the found model configuration.
 * 
 * @returns {ModelConf} - The fetched or constructed model configuration based on the provided parameters.
 *
 * @example
 * const models = [
 *   { name: 'somemodel.gguf', ctx: 2048, template: 'alpaca' }
 * ];
 * 
 * const conf = loadModelFromConf('somemodel.gguf', models);
 * console.log(conf); // { name: 'somemodel.gguf', ctx: 2048, template: 'alpaca' }
 */
function loadModelFromConf(name: string, models: Array<ModelConf>, ctx?: number, template?: string, gpu_layers?: number): ModelConf {
  const modelConf = models.find(item => item.name == name);
  let c: number = ctx ?? 2048;
  if (modelConf) {
    // found a model conf
    if (!ctx) {
      c = modelConf.ctx;
    }
  }
  return { name: name, ctx: c }
}

export { loadModelFromConf }