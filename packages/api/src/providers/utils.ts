import { ChatCompletionFunctionTool } from "openai/resources/index";
import { ToolDefSpec, ToolSpec } from "../../../types/dist/interfaces";

function parseJson(data: string, parseFunc?: (data: string) => Record<string, any>): Record<string, any> {
  let res = {};
  try {
    if (parseFunc) {
      res = parseFunc(data)
    } else {
      res = JSON.parse(data)
    }
  } catch (e) {
    throw new Error(`Error parsing json data: ${data}`)
  }
  return res
}

async function convertImageDataToBase64(imageData: Buffer): Promise<string> {
  const base64String = imageData.toString('base64');
  return base64String;
}

async function convertImageUrlToBase64(imageUrl: string): Promise<string> {
  // Validate URL format
  const urlRegex = /^(http|https):\/\/[^\s]+$/;
  if (!urlRegex.test(imageUrl)) {
    throw new Error('Invalid image URL provided');
  }
  let mimeType: string;
  return fetch(imageUrl, {
    method: 'GET',
    headers: {
      'Accept': 'image/*'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch image: Status ${response.status}`);
      }
      // Store MIME type before processing data
      mimeType = response.headers.get('content-type') || 'image/jpeg';
      return response.arrayBuffer();
    })
    .then(buffer => {
      const base64String = Buffer.from(buffer).toString('base64');
      return base64String;
    })
    .catch(error => {
      throw new Error(`Failed to fetch image: ${error.message}`);
    });
}

function convertToolCallSpec(toolSpec: ToolSpec): ChatCompletionFunctionTool {
  const req = Object.entries(toolSpec.arguments)
    .filter(([, arg]) => arg.required)
    .map(([key]) => key);
  return {
    type: 'function',
    function: {
      name: toolSpec.name,
      description: toolSpec.description,
      parameters: {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(toolSpec.arguments).map(([key, arg]) => [
            key,
            {
              type: arg?.type ? arg.type : 'string',
              description: arg.description
            }
          ])
        ),
        required: req,
      }
    }
  };
}

function generateId(length: number = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

export {
  parseJson,
  convertImageDataToBase64,
  convertImageUrlToBase64,
  convertToolCallSpec,
  generateId,
}