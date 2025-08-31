# LocalLm

An API to query local language models using different backends with a unified interface. LocalLm supports multiple inference engines and provides a consistent way to interact with various local LLM providers.

| Version | Name | Description | Doc |
| --- | --- | --- | --- |
| [![pub package](https://img.shields.io/npm/v/@locallm/types)](https://www.npmjs.com/package/@locallm/types) | [@locallm/types](packages/types) | The shared data types | [Api doc](https://synw.github.io/locallm/types/index.html) - [Readme](packages/types) |
| [![pub package](https://img.shields.io/npm/v/@locallm/api)](https://www.npmjs.com/package/@locallm/api) | [@locallm/api](packages/api) | Run local language models using different backends | [Api doc](https://synw.github.io/locallm/api/index.html) - [Readme](packages/api) |
| [![pub package](https://img.shields.io/npm/v/@locallm/browser)](https://www.npmjs.com/package/@locallm/browser) | [@locallm/browser](packages/browser) | Run quantitized language models inside the browser | [Api doc](https://synw.github.io/locallm/browser/index.html) - [Readme](packages/browser) |

## Why Use LocalLm?

LocalLm provides a unified interface for multiple local language model backends, allowing you to:
- Switch between different inference engines without changing your code
- Access advanced features like streaming, tool calling, and multimodal support
- Work with consistent APIs across different providers
- Get detailed statistics and progress tracking
- Leverage TypeScript support for better development experience

## Supported Backends

- **[Llama.cpp](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)** - High-performance inference with C/C++ backend
- **[Koboldcpp](https://github.com/LostRuins/koboldcpp)** - Feature-rich inference with GPU support
- **[Ollama](https://github.com/jmorganca/ollama)** - Easy-to-use local model management
- **[Wllama](https://github.com/ngxson/wllama)** - In-browser inference using WebAssembly
- **Any OpenAI compatible endpoint** - Connect to custom or cloud OpenAI APIs

## Features

- **Multiple Backend Support**: Seamlessly switch between different inference engines
- **Streaming Responses**: Real-time token streaming for interactive applications
- **Tool/Function Calling**: Execute functions and tools during inference
- **Multimodal Support**: Process both text and images (where supported)
- **Progress Tracking**: Monitor model loading and inference progress
- **Detailed Statistics**: Get comprehensive performance metrics
- **TypeScript Support**: Full type definitions for better development
- **Error Handling**: Robust error handling and recovery mechanisms

## Quickstart

### Prerequisites

- Node.js 18 or higher
- One of the supported backends running locally or accessible via network

### Installation

```bash
# Install the API package
npm install @locallm/api

# Install types package (if needed separately)
npm install @locallm/types
```

### Basic Usage

#### Example with Koboldcpp Provider

```typescript
import { Lm } from "@locallm/api";

const lm = new Lm({
  providerType: "koboldcpp",
  serverUrl: "http://localhost:5001",
  onToken: (t) => process.stdout.write(t),
});

const template = "<s>[INST] {prompt} [/INST]";
const prompt = template.replace("{prompt}", "List the planets in our solar system");

// Run the inference query
const result = await lm.infer(prompt, {
  stream: true,
  temperature: 0.2,
  max_tokens: 200,
});

console.log("\nResult:", result.text);
console.log("Stats:", result.stats);
```

#### Example with Llama.cpp (OpenAI Compatible)

```typescript
import { Lm } from "@locallm/api";

const lm = new Lm({
  providerType: "openai",
  serverUrl: "http://localhost:8080/v1",
  onToken: (t) => process.stdout.write(t),
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  lm.abort().then(() => process.exit());
});

const prompt = "Explain quantum computing in simple terms";

const result = await lm.infer(prompt, {
  stream: true,
  temperature: 0.7,
  max_tokens: 300,
});

console.log("\nFull response:", result.text);
```

## Advanced Usage

### Loading Models

```typescript
// Load a specific model with context size
await lm.loadModel("llama3:8b", 8192);

// Check loaded model info
console.log("Current model:", lm.model);
console.log("Available models:", lm.models);
```

### Using Templates

```typescript
// Using built-in templates
const prompt = lm.template.prompt("What is the capital of France?");

// Using custom templates
const customTemplate = "You are a helpful assistant. User: {prompt} Assistant:";
const formattedPrompt = customTemplate.replace("{prompt}", "Explain photosynthesis");
```

### Tool/Function Calling

```typescript
const weatherTool = {
  name: "getWeather",
  description: "Get current weather for a location",
  arguments: {
    location: {
      description: "The city and state, e.g. San Francisco, CA",
      required: true
    }
  }
};

const result = await lm.infer("What's the weather in London?", {
  stream: true,
  tools: [weatherTool]
});

// Handle tool calls
if (result.toolCalls) {
  for (const toolCall of result.toolCalls) {
    console.log("Tool called:", toolCall.name);
    console.log("Arguments:", toolCall.arguments);
  }
}
```

### Multimodal Support (Ollama)

```typescript
import { convertImageUrlToBase64 } from "@locallm/api";

// Convert image to base64
const imageBase64 = await convertImageUrlToBase64("https://example.com/image.jpg");

const result = await lm.infer("Describe this image", {
  stream: true,
  images: [imageBase64],
  max_tokens: 300
});
```

### Working with History (Openai api)

```typescript
const history = [
  { user: "Hello", assistant: "Hi there!" },
  { user: "How are you?", assistant: "I'm doing well, thanks!" }
];

const result = await lm.infer("What's your name?", {
  stream: true},
  { history: history }  
);
```

## Configuration Options

### Provider Parameters

```typescript
const lm = new Lm({
  providerType: "ollama", // "llamacpp" | "koboldcpp" | "ollama" | "openai" | "browser"
  serverUrl: "http://localhost:11434",
  apiKey: "your-api-key-if-required", // Optional for most providers
  onToken: (token) => process.stdout.write(token), // Optional: streaming callback
  onStartEmit: (stats) => console.log("Started:", stats), // Optional: start callback
  onEndEmit: (result) => console.log("Completed:", result), // Optional: completion callback
  onError: (error) => console.error("Error:", error), // Optional: error callback
});
```

### Inference Parameters

```typescript
const params = {
  stream: true, // Stream response token by token
  model: { name: "llama3:8b", ctx: 8192 }, // Model configuration
  template: "chatml", // Template name (if supported)
  max_tokens: 500, // Maximum tokens to generate
  temperature: 0.7, // Randomness (0.0-1.0)
  top_p: 0.9, // Nucleus sampling threshold
  top_k: 50, // Limit to top K tokens
  repeat_penalty: 1.1, // Penalty for repeating tokens
  stop: ["</s>", "###"], // Stop sequences
  grammar: "root ::= 'hello' 'world';", // GBNF grammar for constrained generation
  images: ["base64-image-data"], // For multimodal models
  extra: { custom: "parameters" } // Provider-specific parameters
};
```

## Examples

The `examples` directory contains comprehensive examples for each provider:

| Example | Description | Provider |
|---------|-------------|----------|
| `basic.js` | Basic text generation | All providers |
| `streaming.js` | Streaming responses | All providers |
| `ollama.js` | Ollama-specific features | Ollama |
| `ollama_img.js` | Image input with Ollama | Ollama |
| `ollama_tools.js` | Tool calling with Ollama | Ollama |
| `llamacpp.js` | Llama.cpp basic usage | Llama.cpp |
| `llamacpp_gnbf.js` | Grammar-based generation | Llama.cpp |
| `koboldcpp.js` | Koboldcpp basic usage | Koboldcpp |
| `openai_api.js` | OpenAI compatible endpoint | OpenAI |
| `openai_api_toolcall.js` | Tool calling with OpenAI | OpenAI |
| `openrouter.js` | Using OpenRouter service | OpenAI |

### Running Examples

```bash
# Clone the repository
git clone https://github.com/synw/locallm
cd locallm

# Install dependencies
npm install

# Build the API package
cd packages/api
npm run build
cd ../..

# Install example dependencies
cd examples
npm install

# Run an example (make sure your LLM server is running)
node llamacpp.js
```

## Provider-Specific Notes

### Ollama

- Use `await lm.modelsInfo()` to list available models
- Models are loaded using `await lm.loadModel(modelName, contextSize)`
- Supports multimodal models with the `images` parameter
- Use `raw: true` in extra parameters for raw prompt mode

### Llama.cpp

- Compatible with OpenAI-compatible endpoints
- Use `grammar` parameter for constrained generation
- Stop sequences can be specified with the `stop` parameter
- Server info available via `await lm.info()`

### Koboldcpp

- Template support with `{prompt}` placeholder
- Uses `/api/extra/generate/stream` endpoint
- Supports various inference parameters
- Auto-retrieves model info on inference

### OpenAI Compatible

- Works with any OpenAI-compatible endpoint
- Full support for tool/function calling
- System messages via `system` parameter
- History management for conversations

## Error Handling

```typescript
try {
  const result = await lm.infer(prompt, params);
  console.log("Success:", result.text);
} catch (error) {
  console.error("Inference failed:", error.message);
  // Handle specific error types
  if (error.message.includes("connection")) {
    // Handle connection errors
  } else if (error.message.includes("model")) {
    // Handle model-related errors
  }
}
```

## Performance Monitoring

```typescript
// Access detailed statistics
const result = await lm.infer(prompt, { stream: true });

console.log("Inference Statistics:");
console.log("- Total time:", result.stats.totalTime, "ms");
console.log("- Inference time:", result.stats.inferenceTime, "ms");
console.log("- Tokens per second:", result.stats.tokensPerSecond);
console.log("- Total tokens:", result.stats.totalTokens);
console.log("- Server stats:", result.serverStats);
```

## Troubleshooting

### Common Issues

**Connection Errors**
- Ensure your LLM server is running and accessible
- Check the server URL and port
- Verify network connectivity

**Model Loading Issues**
- Confirm the model name is correct
- Check if the model is available on the server
- Verify sufficient system resources

**Performance Issues**
- Adjust `temperature` and `top_p` parameters
- Consider reducing `max_tokens` for faster responses
- Check system resources (CPU, memory, GPU)

### Debug Mode

Enable debug output for troubleshooting:

```typescript
const result = await lm.infer(prompt, {
    stream: true
  },
  { debug: true }
);
```

### FAQ

**Q: Can I use LocalLm with cloud providers?**
A: Yes, the OpenAI-compatible provider works with many cloud services that provide OpenAI-compatible APIs.

**Q: How do I add a new provider?**
A: See the `packages/api/src/providers` directory for examples of implementing new providers.

**Q: What's the difference between the packages?**
A: `@locallm/api` provides the main interface, `@locallm/types` contains shared type definitions, and `@locallm/browser` is for browser-based inference.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [Documentation](https://synw.github.io/locallm/)
- [Issues](https://github.com/synw/locallm/issues)
- [Discussions](https://github.com/synw/locallm/discussions)

## Acknowledgments

- [Llama.cpp](https://github.com/ggerganov/llama.cpp) for the excellent C++ implementation
- [Koboldcpp](https://github.com/LostRuins/koboldcpp) for the feature-rich inference server
- [Ollama](https://github.com/jmorganca/ollama) for easy local model management
- [OpenAI](https://openai.com/) for the API standard that many providers follow
