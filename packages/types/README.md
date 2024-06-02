# LocalLm types
Shared data types for the LocalLm api

:books:  [Api doc](https://synw.github.io/locallm/)

## Install
```
npm install @locallm/types
```

## Types

### ModelConf
Represents the configuration of a model.

```typescript
interface ModelConf {
  name: string;
  ctx: number;
}
```

*   **name**: `string` - The unique name of the model.
*   **ctx**: `number` - The context window length, typically used to define how much of the previous data to consider.

Example:
```json
{
  "name": "my_model",
  "ctx": 10
}
```

### InferenceParams
Describes the parameters for making an inference request.

```typescript
interface InferenceParams {
  stream?: boolean | undefined;
  model?: ModelConf | undefined;
  template?: string | undefined;
  threads?: number | undefined;
  max_tokens?: number | undefined;
  temperature?: number | undefined;
  top_k?: number | undefined;
  top_p?: number | undefined;
  min_p?: number | undefined;
  repeat_penalty?: number | undefined;
  tfs?: number | undefined;
  stop?: Array<string> | undefined;
  grammar?: string | undefined;
  image_data?: Array<{ data: string, id: number }> | undefined;
}
```

*   **stream**: `boolean | undefined` - Indicates if results should be streamed progressively.
*   **model**: `ModelConf | undefined` - The model configuration details for inference.
*   **template**: `string | undefined` - The template to use, for the backends that support it.
*   **threads**: `number | undefined` - The number of threads to use for parallel processing.
*   **max_tokens**: `number | undefined` - The number of predictions to return.
*   **temperature**: `number | undefined` - Adjusts randomness in sampling; higher values mean more randomness.
*   **top_k**: `number | undefined` - Limits the result set to the top K results.
*   **top_p**: `number | undefined` - Filters results based on cumulative probability.
*   **min_p**: `number | undefined` - The minimum probability for a token to be considered, relative to the probability of the most likely token.
*   **repeat_penalty**: `number | undefined` - Adjusts penalty for repeated tokens.
*   **tfs**: `number | undefined` - Used for custom tuning.
*   **stop**: `Array<string> | undefined` - List of stop words or phrases to halt predictions.
*   **grammar**: `string | undefined` - The gnbf grammar to use for grammar-based sampling.
*   **image_data**: `Array<{ data: string, id: number }> | undefined` : The base64 images data (for multimodal models).

Example:
```json
{
  "stream": true,
  "model": {
    "name": "my_model",
    "ctx": 4192
  },
  "template": "my_template",
  "threads": 4,
  "max_tokens": 20,
  "temperature": 0.5,
  "top_k": 10,
  "top_p": 0.8,
  "min_p": 0.2,
  "repeat_penalty": 1.0,
  "tfs": undefined,
  "stop": ["stop_word1", "stop_word2"],
  "grammar": "my_gnb_grammar",
  "image_data": [
    {
      "data": "iVBORw0KGg...==",
      "id": 1
    },
    {
      "data": "iVBORw0KGg...==",
      "id": 2
    }
  ]
}
```

### InferenceResult
Represents the result returned after an inference request.

```typescript
interface InferenceResult {
  text: string;
  data?: Record<string, any> | undefined;
  stats?: InferenceStats | undefined;
  serverStats?: Record<string, any> | undefined;
}
```

*   **text**: `string` - The textual representation of the generated inference.
*   **data**: `Record<string, any> | undefined` - Additional data related to the inference.
*   **stats**: `InferenceStats | undefined` - Additional statistics or metadata related to the inference.
*   **serverStats**: `Record<string, any> | undefined` - Additional server-related statistics.

Example:
```json
{
  "text": "This is a generated text.",
  "data": {
    "inference_time": 123,
    "model_name": "my_model"
  },
  "stats": {
    "ingestionTime": 10,
    "inferenceTime": 20,
    "totalTime": 30
  }
}
```

### InferenceStats
Represents the statistics of an inference.

```typescript
interface InferenceStats {
  ingestionTime: number;
  inferenceTime: number;
  totalTime: number;
  ingestionTimeSeconds: number;
  inferenceTimeSeconds: number;
  totalTimeSeconds: number;
  totalTokens: number;
  tokensPerSecond: number;
}
```

*   **ingestionTime**: `number` - The time taken to ingest the input data in milliseconds.
*   **inferenceTime**: `number` - The time taken to perform the inference in milliseconds.
*   **totalTime**: `number` - The total time taken to perform the inference in milliseconds.
*   **ingestionTimeSeconds**: `number` - The time taken to ingest the input data in seconds.
*   **inferenceTimeSeconds**: `number` - The time taken to perform the inference in seconds.
*   **totalTimeSeconds**: `number` - The total time taken to perform the inference in seconds.
*   **totalTokens**: `number` - The total number of tokens processed.
*   **tokensPerSecond**: `number` - The number of tokens processed per second.

Example:
```json
{
  "ingestionTime": 10,
  "inferenceTime": 20,
  "totalTime": 30,
  "ingestionTimeSeconds": 0.01,
  "inferenceTimeSeconds": 0.02,
  "totalTimeSeconds": 0.03,
  "totalTokens": 100,
  "tokensPerSecond": 10
}
```

### LmProvider
Defines the structure and behavior of an LM Provider.

```typescript
interface LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  serverUrl: string;
  apiKey: string;
  model: ModelConf | undefined;
  models: Array<ModelConf> | undefined;
  info: () => Promise<Record<string, any>> | undefined;
  modelsInfo: () => Promise<Array<ModelConf>> | undefined;
  loadModel: (name: string) => Promise<void>;
  infer: (prompt: string, params: InferenceParams) => Promise<InferenceResult>;
  abort: () => Promise<void>;
  onToken: (token: string) => void;
  onStartEmit?: (data: any) => void | undefined;
  onError?: (err: string) => void | undefined;
  defaults?: LmDefaults | undefined;
}
```

*   **name**: `string` - Identifier for the LM provider.
*   **api**: `ReturnType<typeof useApi>` - API utility being used (either restmix or goinfer based).
*   **serverUrl**: `string` - The URL endpoint for the provider's server.
*   **apiKey**: `string` - The key used for authentication with the provider's API.
*   **model**: `ModelConf | undefined` - Active model configuration.
*   **models**: `Array<ModelConf> | undefined` - List of available model configurations.
*   **info**: `() => Promise<Record<string, any>> | undefined` - Retrieves information about available server config.
*   **modelsInfo**: `() => Promise<Array<ModelConf>> | undefined` - Retrieves information about available models.
*   **loadModel**: `(name: string) => Promise<void>` - Loads a model by name, with optional context and template.
*   **infer**: `(prompt: string, params: InferenceParams) => Promise<InferenceResult>` - Makes an inference based on provided prompt and parameters.
*   **abort**: `() => Promise<void>` - Aborts a currently running inference task.
*   **onToken**: `(token: string) => void` - Callback when a new token is received (typically for authentication).
*   **onStartEmit**: `(data: any) => void | undefined` - Callback triggered when inference starts.
*   **onError**: `(err: string) => void | undefined` - Callback triggered on errors during inference.
*   **defaults**: `LmDefaults | undefined` - Default settings for this provider.

Example:
```json
{
  "name": "my_lm_provider",
  "api": { useApi: () => {} },
  "serverUrl": "https://myserver.com/api",
  "apiKey": "",
  "model": {
    "name": "my_model",
    "ctx": 10
  },
  "models": [
    {
      "name": "model1",
      "ctx": 10
    },
    {
      "name": "model2",
      "ctx": 10
    }
  ],
  "info": () => Promise.resolve({}),
  "modelsInfo": () => Promise.resolve([]),
  "loadModel": (name) => Promise.resolve(),
  "infer": (prompt, params) => Promise.resolve({ text: "generated text" }),
  "abort": () => Promise.resolve(),
  "onToken": (token) => console.log(`Received token: ${token}`),
  "onStartEmit": (data) => console.log(`Inference started with data: ${JSON.stringify(data)}`),
  "onError": (err) => console.error(`Error occurred: ${err}`),
  "defaults": {
    "ctx": 10,
    "model": "my_model"
  }
}
```

### LmDefaults
Default parameters that can be used with an LM provider.

```typescript
interface LmDefaults {
  ctx?: number | undefined;
  model?: string | undefined;
  inferenceParams?: InferenceParams | undefined;
}
```

*   **ctx**: `number | undefined` - Default context window length.
*   **model**: `string | undefined` - Default model name to use.
*   **inferenceParams**: `InferenceParams | undefined` - Default inference parameters.

Example:
```json
{
  "ctx": 10,
  "model": "my_model",
  "inferenceParams": {
    "stream": true,
    "max_tokens": 20
  }
}
```

### LmProviderParams
Parameters required when creating a new LM provider instance.

```typescript
interface LmProviderParams {
  name: string;
  serverUrl: string;
  apiKey: string;
  onToken?: (token: string) => void | undefined;
  onStartEmit?: (data: any) => void | undefined;
  onError?: (err: string) => void | undefined;
  defaults?: LmDefaults | undefined;
}
```

*   **name**: `string` - Identifier for the LM provider.
*   **serverUrl**: `string` - The URL endpoint for the provider's server.
*   **apiKey**: `string` - The key used for authentication.
*   **onToken**: `(token: string) => void | undefined` - Callback when a new token is received (typically for authentication).
*   **onStartEmit**: `(data: any) => void | undefined` - Callback triggered when inference starts.
*   **onError**: `(err: string) => void | undefined` - Callback triggered on errors during inference.
*   **defaults**: `LmDefaults | undefined` - Default settings.

Example:
```json
{
  "name": "ollama",
  "serverUrl": "http://localhost:11434",
  "apiKey": "",
  "onToken": (token) => console.log(`Received token: ${token}`),
  "onStartEmit": (data) => console.log(`Inference started with data: ${JSON.stringify(data)}`),
  "onError": (err) => console.error(`Error occurred: ${err}`),
  "defaults": {
    "ctx": 10,
    "model": "my_model"
  }
}
```

### LmParams
Parameters for initializing a Language Model.

```typescript
interface LmParams {
  providerType: LmProviderType;
  serverUrl: string;
  onToken?: (token: string) => void | undefined;
  apiKey?: string | undefined;
  onStartEmit?: (data: any) => void | undefined;
  onError?: (err: string) => void | undefined;
  defaults?: LmDefaults | undefined;
}
```

*   **providerType**: `LmProviderType` - Type of provider ("koboldcpp", "ollama", "goinfer").
*   **serverUrl**: `string` - The URL endpoint for the LM service.
*   **onToken**: `(token: string) => void | undefined` - Callback when a new token is received (typically for authentication).
*   **apiKey**: `string | undefined` - Optional API key for authentication.
*   **onStartEmit**: `(data: any) => void | undefined` - Callback triggered when inference starts.
*   **onError**: `(err: string) => void | undefined` - Callback triggered on errors during inference.
*   **defaults**: `LmDefaults | undefined` - Default settings.

Example:
```json
{
  "providerType": "koboldcpp",
  "serverUrl": "https://myserver.com/api",
  "onToken": (token) => console.log(`Received token: ${token}`),
  "apiKey": "my_api_key",
  "onStartEmit": (data) => console.log(`Inference started with data: ${JSON.stringify(data)}`),
  "onError": (err) => console.error(`Error occurred: ${err}`),
  "defaults": {
    "ctx": 10,
    "model": "my_model"
  }
}
```

### LmProviderType
Represents the type of LM provider.

```typescript
type LmProviderType = "llamacpp" | "koboldcpp" | "ollama";
```

Example:
```json
{
  "providerType": "koboldcpp"
}
```

:books: [Api doc](https://synw.github.io/locallm/)