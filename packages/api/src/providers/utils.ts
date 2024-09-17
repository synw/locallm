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

export { parseJson }