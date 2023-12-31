# LocalLm types

Shared data types for the LocalLm api

:books: [Api doc](https://synw.github.io/locallm/)

## Install

```bash
npm install @locallm/types
```

## Types

### ModelConf

Represents the configuration of a model.

- **name**: `string` - The unique name of the model.
- **ctx**: `number` - The context window length, typically used to define how much of the previous data to consider.

---

### InferenceParams

Describes the parameters for making an inference request.

- **stream**: `boolean | undefined` - Indicates if results should be streamed progressively.
- **model**: `ModelConf | undefined` - The model configuration details for inference.
- **template**: `string | undefined` - The template to use, for the backends that support it.
- **threads**: `number | undefined` - The number of threads to use for parallel processing.
- **max_tokens**: `number | undefined` - The number of predictions to return.
- **temperature**: `number | undefined` - Adjusts randomness in sampling; higher values mean more randomness.
- **top_k**: `number | undefined` - Limits the result set to the top K results.
- **top_p**: `number | undefined` - Filters results based on cumulative probability.
- **min_p**: `number | undefined` - The minimum probability for a token to be considered, relative to the probability of the most likely token.
- **repeat_penalty**: `number | undefined` - Adjusts penalty for repeated tokens.
- **tfs**: `number | undefined` - Used for custom tuning.
- **stop**: `Array<string> | undefined` - List of stop words or phrases to halt predictions.
- **grammar**: `string | undefined` - The gnbf grammar to use for grammar-based sampling.
- **image_data**: `Array<{ data: string, id: number }> | undefined`: The base64 images data (for multimodal models).

---

### InferenceResult

Represents the result returned after an inference request.

- **text**: `string` - The textual representation of the generated inference.
- **stats**: `Record<string, any> | undefined` - Additional statistics or metadata related to the inference.

---

### LmProvider

Defines the structure and behavior of an LM Provider.

- **name**: `string` - Identifier for the LM provider.
- **api**: `ReturnType<typeof useApi> | ReturnType<typeof useGoinfer>` - API utility being used (either restmix or goinfer based).
- **serverUrl**: `string` - The URL endpoint for the provider's server.
- **apiKey**: `string` - The key used for authentication with the provider's API.
- **model**: `ModelConf` - Active model configuration.
- **models**: `Array<ModelConf>` - List of available model configurations.
- **modelsInfo**: `Function` - Retrieves information about available models.
- **loadModel**: `Function` - Loads a model by name, with optional context and template.
- **infer**: `Function` - Makes an inference based on provided prompt and parameters.
- **abort**: `Function` - Aborts a currently running inference task.
- **onToken**: `Function` - Callback when a new token is received (typically for authentication).
- **onStartEmit**: `Function | undefined` - Callback triggered when inference starts.
- **onError**: `Function | undefined` - Callback triggered on errors during inference.
- **defaults**: `LmDefaults | undefined` - Default settings for this provider.

---

### LmDefaults

Default parameters that can be used with an LM provider.

- **ctx**: `number | undefined` - Default context window length.
- **model**: `string | undefined` - Default model name to use.
- **inferenceParams**: `InferenceParams | undefined` - Default inference parameters.

---

### LmProviderParams

Parameters required when creating a new LM provider instance.

- **name**: `string` - Identifier for the LM provider.
- **serverUrl**: `string` - The URL endpoint for the provider's server.
- **apiKey**: `string` - The key used for authentication.
- **onToken**: `Function` - Callback when a new token is received.
- **onStartEmit**: `Function | undefined` - Callback triggered when inference starts.
- **onError**: `Function | undefined` - Callback triggered on errors.
- **defaults**: `LmDefaults | undefined` - Default settings.

---

### LmParams

Parameters for initializing a Language Model.

- **providerType**: `LmProviderType` - Type of provider ("koboldcpp", "ollama", "goinfer").
- **serverUrl**: `string` - The URL endpoint for the LM service.
- **onToken**: `Function` - Callback when a new token is received.
- **apiKey**: `string | undefined` - Optional API key for authentication.
- **onStartEmit**: `Function | undefined` - Callback triggered when inference starts.
- **onError**: `Function | undefined` - Callback triggered on errors.
- **defaults**: `LmDefaults | undefined` - Default settings.

---

### LmProviderType

Represents the type of LM provider.

- Type: `"llamacpp" | "koboldcpp" | "ollama"`

:books: [Api doc](https://synw.github.io/locallm/)

