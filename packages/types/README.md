# LocalLm types
Shared data types for the LocalLm api

:books:  [Api doc](https://synw.github.io/locallm/)

## Install
```
npm install @locallm/types
```

## Overview
This package provides TypeScript interfaces and type definitions for the LocalLm library. These types define the structure of model configurations, inference parameters, provider interfaces, and other core components used throughout the LocalLm ecosystem.

## Types Documentation

### Model Configuration

#### ModelConf
Represents the configuration of a model.

```typescript
interface ModelConf {
  name: string;
  ctx?: number;
  info?: { size: string, quant: string };
  extra?: Record<string, any>;
}
```

*   **name**: `string` - The unique name of the model.
*   **ctx**: `number | undefined` - The context window length, typically used to define how much of the previous data to consider.
*   **info**: `{ size: string, quant: string } | undefined` - Some meta info about the model: parameter size and quantization level.
*   **extra**: `Record<string, any> | undefined` - Extra parameters like urls for browser models.

Example:
```json
{
  "name": "gpt-3",
  "ctx": 2048,
  "info": { "size": "175B", "quant": "q4_0" },
  "extra": { "url": "http://example.com/model" }
}
```

#### ModelTemplate
Template information for model.

```typescript
interface ModelTemplate {
  name: string;
  ctx: number;
}
```

*   **name**: `string` - The name of the template.
*   **ctx**: `number` - The context window size for the model.

Example:
```json
{
  "name": "chatml",
  "ctx": 2048
}
```

#### ModelState
Represents the state of the available models on server.

```typescript
interface ModelState {
  models: Record<string, ModelTemplate>;
  isModelLoaded: boolean;
  loadedModel: string;
  ctx: number;
}
```

*   **models**: `Record<string, ModelTemplate>` - The models info object (name, template name, context window size).
*   **isModelLoaded**: `boolean` - Indicates whether a model is loaded or not.
*   **loadedModel**: `string` - The loaded model name, empty if no model is loaded.
*   **ctx**: `number` - The loaded model context window size, 0 if no model is loaded.

Example:
```json
{
  "models": { "gpt3": { "name": "gpt-3", "ctx": 2048 } },
  "isModelLoaded": true,
  "loadedModel": "gpt-3",
  "ctx": 2048
}
```

### Inference

#### InferenceParams
Describes the parameters for making an inference request.

```typescript
interface InferenceParams {
  stream?: boolean;
  model?: ModelConf;
  template?: string;
  max_tokens?: number;
  top_k?: number;
  top_p?: number;
  min_p?: number;
  temperature?: number;
  repeat_penalty?: number;
  tfs?: number;
  stop?: Array<string>;
  grammar?: string;
  tsGrammar?: string;
  schema?: Record<string, any>;
  images?: Array<string>;
  extra?: Record<string, any>;
}
```

*   **stream**: `boolean | undefined` - Indicates if results should be streamed progressively.
*   **model**: `ModelConf | undefined` - The model configuration details for inference.
*   **template**: `string | undefined` - The template to use, for the backends that support it.
*   **max_tokens**: `number | undefined` - The number of predictions to return.
*   **top_k**: `number | undefined` - Limits the result set to the top K results.
*   **top_p**: `number | undefined` - Filters results based on cumulative probability.
*   **min_p**: `number | undefined` - The minimum probability for a token to be considered, relative to the probability of the most likely token.
*   **temperature**: `number | undefined` - Adjusts randomness in sampling; higher values mean more randomness.
*   **repeat_penalty**: `number | undefined` - Adjusts penalty for repeated tokens.
*   **tfs**: `number | undefined` - Set the tail free sampling value.
*   **stop**: `Array<string> | undefined` - List of stop words or phrases to halt predictions.
*   **grammar**: `string | undefined` - The gnbf grammar to use for grammar-based sampling.
*   **tsGrammar**: `string | undefined` - A Typescript interface to be converted to a gnbf grammar to use for grammar-based sampling.
*   **schema**: `Record<string, any> | undefined` - A json schema to format the output.
*   **images**: `Array<string> | undefined` - The base64 images data (for multimodal models).
*   **extra**: `Record<string, any> | undefined` - Extra parameters to include in the payload.

Example:
```json
{
  "stream": true,
  "model": { "name": "qwen3:4b", "ctx": 8192 },
  "template": "chatml",
  "max_tokens": 150,
  "top_k": 50,
  "top_p": 0.9,
  "min_p": 0.01,
  "temperature": 0.7,
  "repeat_penalty": 1.2,
  "tfs": 0.8,
  "stop": ["###"],
  "grammar": "default_grammar",
  "images": ["data:image/png;base64,..."]
}
```

#### InferenceResult
Represents the result returned after an inference request.

```typescript
interface InferenceResult {
  text: string;
  stats: InferenceStats;
  serverStats: Record<string, any>;
  toolCalls?: Array<ToolCallSpec>;
}
```

*   **text**: `string` - The textual representation of the generated inference.
*   **stats**: `InferenceStats` - Additional statistics or metadata related to the inference.
*   **serverStats**: `Record<string, any>` - Additional server-related statistics.
*   **toolCalls**: `Array<ToolCallSpec> | undefined` - Tool calls made during inference.

Example:
```json
{
  "text": "The quick brown fox jumps over the lazy dog.",
  "stats": {
    "ingestionTime": 150,
    "inferenceTime": 300,
    "totalTime": 450,
    "ingestionTimeSeconds": 0.15,
    "inferenceTimeSeconds": 0.3,
    "totalTimeSeconds": 0.45,
    "totalTokens": 200,
    "tokensPerSecond": 444
  },
  "serverStats": { "someServerKey": "someServerValue" },
  "toolCalls": [{ "id": "1", "name": "getWeather", "arguments": { "location": "New York" } }]
}
```

#### InferenceStats
Represents the statistics of an inference.

```typescript
interface InferenceStats extends IngestionStats {
  totalTime: number;
  inferenceTime: number;
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
  "ingestionTime": 150,
  "inferenceTime": 300,
  "totalTime": 450,
  "ingestionTimeSeconds": 0.15,
  "inferenceTimeSeconds": 0.3,
  "totalTimeSeconds": 0.45,
  "totalTokens": 200,
  "tokensPerSecond": 444
}
```

#### IngestionStats
Represents the statistics of an inference prompt ingestion time.

```typescript
interface IngestionStats {
  ingestionTime: number;
  ingestionTimeSeconds: number;
}
```

*   **ingestionTime**: `number` - The time taken to ingest the input data in milliseconds.
*   **ingestionTimeSeconds**: `number` - The time taken to ingest the input data in seconds.

Example:
```json
{
  "ingestionTime": 150,
  "ingestionTimeSeconds": 0.15
}
```

#### InferenceOptions
Options for inference requests.

```typescript
interface InferenceOptions {
  debug?: boolean;
  verbose?: boolean;
  tools?: Array<ToolSpec>;
  history?: Array<HistoryTurn>;
  system?: string;
  assistant?: string;
}
```

*   **debug**: `boolean | undefined` - Enable debug mode for detailed logging.
*   **verbose**: `boolean | undefined` - Enable verbose output.
*   **tools**: `Array<ToolSpec> | undefined` - Array of available tools for the conversation.
*   **history**: `Array<HistoryTurn> | undefined` - Conversation history to include in the inference.
*   **system**: `string | undefined` - System message to set the context for the conversation.
*   **assistant**: `string | undefined` - Assistant message to include in the context.

Example:
```json
{
  "debug": true,
  "tools": [weatherTool],
  "history": [
    { "user": "Hello", "assistant": "Hi there!" }
  ],
  "system": "You are a helpful assistant."
}
```

### Conversation and Tools

#### HistoryTurn
Represents a single turn in a conversation history.

```typescript
interface HistoryTurn {
  user?: string;
  assistant?: string;
  tools?: { calls: Array<ToolCallSpec>, results: Array<{ id: string, content: string }> };
}
```

*   **user**: `string | undefined` - The user's message in this turn.
*   **assistant**: `string | undefined` - The assistant's response in this turn.
*   **tools**: `{ calls: Array<ToolCallSpec>, results: Array<{ id: string, content: string }> } | undefined` - Tool calls and results for this turn.

Example:
```json
{
  "user": "What's the weather like?",
  "assistant": "The weather is sunny with a temperature of 72°F.",
  "tools": {
    "calls": [{ "id": "1", "name": "getWeather", "arguments": { "location": "New York" } }],
    "results": [{ "id": "1", "content": "Sunny, 72°F" }]
  }
}
```

#### ToolCallSpec
Represents a tool call specification.

```typescript
interface ToolCallSpec {
  id?: string;
  name: string;
  arguments?: {
    [key: string]: string;
  };
}
```

*   **id**: `string | undefined` - The unique identifier for the tool call.
*   **name**: `string` - The name of the tool being called.
*   **arguments**: `Record<string, string> | undefined` - The arguments to pass to the tool.

Example:
```json
{
  "id": "1",
  "name": "getWeather",
  "arguments": { "location": "New York" }
}
```

#### ToolDefSpec
Specification for a tool that can be used within the conversation.

```typescript
interface ToolDefSpec {
  name: string;
  description: string;
  arguments: {
    [key: string]: {
      description: string;
      type?: string;
      required?: boolean;
    };
  };
}
```

*   **name**: `string` - The name of the tool.
*   **description**: `string` - A description of what the tool does.
*   **arguments**: `Record<string, { description: string, type?: string, required?: boolean }>` - Arguments required by the tool, with descriptions for each argument.

Example:
```json
{
  "name": "WeatherFetcher",
  "description": "Fetches weather information.",
  "arguments": {
    "location": {
      "description": "The location for which to fetch the weather.",
      "required": true
    }
  }
}
```

#### ToolSpec
Represents a tool specification with an execute function.

```typescript
interface ToolSpec extends ToolDefSpec {
  execute: <O = any>(args: { [key: string]: string; } | undefined) => Promise<O>;
}
```

*   **execute**: `(args: Record<string, string> | undefined) => Promise<any>` - The function to execute the tool with the provided arguments.

Example:
```typescript
const toolSpec: ToolSpec = {
  name: "WeatherFetcher",
  description: "Fetches weather information.",
  arguments: {
    location: {
      description: "The location for which to fetch the weather.",
      required: true
    }
  },
  execute: async (args) => {
    const { location } = args || {};
    return `Weather in ${location}: Sunny, 72°F`;
  }
}
```

### Language Model Providers

#### LmProvider
Defines the structure and behavior of an LM Provider.

```typescript
interface LmProvider {
  name: string;
  api: ReturnType<typeof useApi>;
  serverUrl: string;
  apiKey: string;
  model: ModelConf;
  models: Array<ModelConf>;
  info: () => Promise<Record<string, any>>;
  modelsInfo: () => Promise<void>;
  loadModel: (name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) => Promise<void>;
  infer: (prompt: string, params: InferenceParams, options?: InferenceOptions) => Promise<InferenceResult>;
  abort: () => Promise<void>;
  onToken?: (t: string) => void;
  onStartEmit?: (data: IngestionStats) => void;
  onEndEmit?: (result: InferenceResult) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}
```

*   **name**: `string` - Identifier for the LM provider.
*   **api**: `ReturnType<typeof useApi>` - API utility being used.
*   **serverUrl**: `string` - The URL endpoint for the provider's server.
*   **apiKey**: `string` - The key used for authentication with the provider's API.
*   **model**: `ModelConf` - Active model configuration.
*   **models**: `Array<ModelConf>` - List of available model configurations.
*   **info**: `() => Promise<Record<string, any>>` - Retrieves information about available server config.
*   **modelsInfo**: `() => Promise<void>` - Retrieves information about available models.
*   **loadModel**: `(name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) => Promise<void>` - Loads a model by name, with optional context.
*   **infer**: `(prompt: string, params: InferenceParams, options?: InferenceOptions) => Promise<InferenceResult>` - Makes an inference based on provided prompt and parameters.
*   **abort**: `() => Promise<void>` - Aborts a currently running inference task.
*   **onToken**: `(t: string) => void | undefined` - Callback when a new token is received.
*   **onStartEmit**: `(data: IngestionStats) => void | undefined` - Callback triggered when inference starts.
*   **onEndEmit**: `(result: InferenceResult) => void | undefined` - Callback triggered when inference ends.
*   **onError**: `(err: string) => void | undefined` - Callback triggered on errors during inference.
*   **defaults**: `LmDefaults | undefined` - Default settings for this provider.

Example:
```json
{
  "name": "koboldcpp",
  "api": { useApi: () => {} },
  "serverUrl": "https://myserver.com/api",
  "apiKey": "your-api-key",
  "model": { "name": "gpt-3", "ctx": 2048 },
  "models": [{ "name": "gpt-3", "ctx": 2048 }],
  "info": async () => ({ "config": "some-config" }),
  "modelsInfo": async () => {},
  "loadModel": async (name, ctx, urls, onLoadProgress) => {},
  "infer": async (prompt, params, options) => ({ 
    "text": "result", 
    "stats": { 
      "ingestionTime": 0, 
      "ingestionTimeSeconds": 0,
      "inferenceTime": 0, 
      "inferenceTimeSeconds": 0,
      "totalTime": 0,
      "totalTimeSeconds": 0,
      "totalTokens": 0,
      "tokensPerSecond": 0
    }, 
    "serverStats": {} 
  }),
  "abort": async () => {},
  "onToken": (t) => console.log(t),
  "onStartEmit": (data) => console.log(data),
  "onEndEmit": (result) => console.log(result),
  "onError": (err) => console.error(err)
}
```

#### LmProviderParams
Parameters required when creating a new LM provider instance.

```typescript
interface LmProviderParams {
  name: string;
  serverUrl: string;
  apiKey?: string;
  onToken?: (t: string) => void;
  onStartEmit?: (data: IngestionStats) => void;
  onEndEmit?: (result: InferenceResult) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}
```

*   **name**: `string` - Identifier for the LM provider.
*   **serverUrl**: `string` - The URL endpoint for the provider's server.
*   **apiKey**: `string | undefined` - The key used for authentication.
*   **onToken**: `(t: string) => void | undefined` - Callback when a new token is received.
*   **onStartEmit**: `(data: IngestionStats) => void | undefined` - Callback triggered when inference starts.
*   **onEndEmit**: `(result: InferenceResult) => void | undefined` - Callback triggered when inference ends.
*   **onError**: `(err: string) => void | undefined` - Callback triggered on errors.
*   **defaults**: `LmDefaults | undefined` - Default settings.

Example:
```json
{
  "name": "koboldcpp",
  "serverUrl": "http://example.com/api",
  "apiKey": "your-api-key",
  "onToken": (t) => console.log(t),
  "onStartEmit": (data) => console.log(data),
  "onEndEmit": (result) => console.log(result),
  "onError": (err) => console.error(err)
}
```

#### LmParams
Parameters for initializing a Language Model.

```typescript
interface LmParams {
  providerType: LmProviderType;
  serverUrl: string;
  apiKey?: string;
  onToken?: (t: string) => void;
  onStartEmit?: (data: IngestionStats) => void;
  onEndEmit?: (result: InferenceResult) => void;
  onError?: (err: string) => void;
  defaults?: LmDefaults;
}
```

*   **providerType**: `LmProviderType` - Type of provider.
*   **serverUrl**: `string` - The URL endpoint for the LM service.
*   **apiKey**: `string | undefined` - Optional API key for authentication.
*   **onToken**: `(t: string) => void | undefined` - Callback when a new token is received.
*   **onStartEmit**: `(data: IngestionStats) => void | undefined` - Callback triggered when inference starts.
*   **onEndEmit**: `(result: InferenceResult) => void | undefined` - Callback triggered when inference ends.
*   **onError**: `(err: string) => void | undefined` - Callback triggered on errors.
*   **defaults**: `LmDefaults | undefined` - Default settings.

Example:
```json
{
  "providerType": "koboldcpp",
  "serverUrl": "http://example.com/api",
  "onToken": (t) => console.log(t),
  "apiKey": "your-api-key",
  "onStartEmit": (data) => console.log(data),
  "onEndEmit": (result) => console.log(result),
  "onError": (err) => console.error(err)
}
```

#### LmDefaults
Default parameters that can be used with an LM provider.

```typescript
interface LmDefaults {
  model?: ModelConf;
  inferenceParams?: InferenceParams;
}
```

*   **model**: `ModelConf | undefined` - Default model conf to use.
*   **inferenceParams**: `InferenceParams | undefined` - Default inference parameters.

Example:
```json
{
  "model": { "name": "gpt-3", "ctx": 2048 },
  "inferenceParams": { "max_tokens": 150, "top_k": 50 }
}
```

### Progress and Callback Types

#### OnLoadProgressBasic
Represents the basic progress of a load operation.

```typescript
interface OnLoadProgressBasic {
  total: number;
  loaded: number;
}
```

*   **total**: `number` - The total number of items to load.
*   **loaded**: `number` - The number of items that have been loaded so far.

Example:
```json
{
  "total": 100,
  "loaded": 50
}
```

#### OnLoadProgressFull
Represents the full progress of a load operation, including percentage.

```typescript
interface OnLoadProgressFull extends OnLoadProgressBasic {
  percent: number;
}
```

*   **total**: `number` - The total number of items to load.
*   **loaded**: `number` - The number of items that have been loaded so far.
*   **percent**: `number` - The percentage of items that have been loaded so far.

Example:
```json
{
  "total": 100,
  "loaded": 50,
  "percent": 50
}
```

#### OnLoadProgress
Type definition for a progress callback function with full details.

```typescript
type OnLoadProgress = (data: OnLoadProgressFull) => void;
```

Example:
```typescript
const onLoadProgress: OnLoadProgress = (data) => {
  console.log(`Loaded ${data.loaded} of ${data.total} (${data.percent}%)`);
};
```

#### BasicOnLoadProgress
Type definition for a basic progress callback function.

```typescript
type BasicOnLoadProgress = (data: OnLoadProgressBasic) => void;
```

Example:
```typescript
const onLoadProgress: BasicOnLoadProgress = (data) => {
  console.log(`Loaded ${data.loaded} of ${data.total}`);
};
```

### Provider Types

#### LmProviderType
Represents the type of LM provider.

```typescript
type LmProviderType = "llamacpp" | "koboldcpp" | "ollama" | "openai" | "browser";
```

Example:
```json
{
  "providerType": "koboldcpp"
}
```

## Usage Examples

### Basic Model Configuration
```typescript
import { ModelConf } from '@locallm/types';

const modelConfig: ModelConf = {
  name: 'gpt-3.5-turbo',
  ctx: 4096,
  info: { size: '175B', quant: 'q4_0' }
};
```

### Making an Inference Request
```typescript
import { 
  InferenceParams, 
  InferenceResult, 
  ModelConf 
} from '@locallm/types';

const model: ModelConf = { name: 'gpt-3.5-turbo', ctx: 4096 };
const params: InferenceParams = {
  stream: true,
  model,
  max_tokens: 150,
  temperature: 0.7,
  stop: ['###']
};

// This would be used with an actual LM provider
const result: InferenceResult = await provider.infer(
  'Tell me about artificial intelligence',
  params
);
```

### Using Conversation History
```typescript
import { 
  HistoryTurn, 
  InferenceOptions 
} from '@locallm/types';

const history: Array<HistoryTurn> = [
  {
    user: 'Hello, how are you?',
    assistant: 'I am doing well, thank you for asking!'
  },
  {
    user: 'What can you help me with?',
    assistant: 'I can help with various tasks like answering questions, providing information, and assisting with creative writing.'
  }
];

const options: InferenceOptions = {
  history,
  system: 'You are a helpful assistant that responds briefly.'
};
```

### Working with Tools
```typescript
import { 
  ToolSpec, 
  ToolDefSpec,
  ToolCallSpec 
} from '@locallm/types';

const weatherTool: ToolSpec = {
  name: 'getWeather',
  description: 'Get current weather information for a location',
  arguments: {
    location: {
      description: 'The city and state to get weather for',
      required: true
    }
  },
  execute: async (args) => {
    const { location } = args || {};
    // In a real implementation, this would call a weather API
    return { temperature: '72°F', condition: 'Sunny' };
  }
};

// Tool call example
const toolCall: ToolCallSpec = {
  id: '1',
  name: 'getWeather',
  arguments: { location: 'New York, NY' }
};
```

### Setting up a Language Model Provider
```typescript
import { 
  LmProvider, 
  LmProviderParams, 
  LmDefaults,
  ModelConf 
} from '@locallm/types';

const providerParams: LmProviderParams = {
  name: 'koboldcpp',
  serverUrl: 'http://localhost:5001',
  apiKey: 'your-api-key',
  onToken: (token) => console.log(`Token: ${token}`),
  onStartEmit: (stats) => console.log(`Started ingestion: ${stats.ingestionTime}ms`),
  onEndEmit: (result) => console.log(`Generated ${result.text}`),
  onError: (error) => console.error(`Error: ${error}`),
  defaults: {
    model: { name: 'gpt-3.5-turbo', ctx: 4096 },
    inferenceParams: { temperature: 0.7, max_tokens: 100 }
  }
};

// This would be used to initialize a provider
const provider: LmProvider = await createLmProvider(providerParams);
```

### Loading a Model with Progress Tracking
```typescript
import { OnLoadProgress } from '@locallm/types';

const onProgress: OnLoadProgress = (data) => {
  console.log(`Loading model: ${data.percent}% (${data.loaded}/${data.total})`);
};

await provider.loadModel(
  'gpt-3.5-turbo',
  4096,
  undefined, // urls
  onProgress
);
```

## Property Reference Table

| Interface | Key Properties | Required |
|-----------|----------------|----------|
| ModelConf | name, ctx | name |
| InferenceParams | stream, model, template, max_tokens, etc. | none |
| InferenceResult | text, stats, serverStats | all |
| InferenceStats | ingestionTime, inferenceTime, totalTime, etc. | all |
| LmProvider | name, api, serverUrl, apiKey, model, models, etc. | most |
| ToolSpec | name, description, arguments, execute | all |
| LmProviderType | providerType | - |

:books: [Api doc](https://synw.github.io/locallm/)
