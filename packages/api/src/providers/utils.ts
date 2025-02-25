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

export { parseJson, convertImageDataToBase64, convertImageUrlToBase64 }