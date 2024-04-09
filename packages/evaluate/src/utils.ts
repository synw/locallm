function extractCodeBetweenTags(input: string): string | null {
  // Regular expression to match code between markdown tags with any label
  const regex = /```[a-zA-Z]*\s*([\s\S]*?)\s*```/gm;
  const match = regex.exec(input);
  return match ? match[1].trim() : null;
}

function trimStr(str: string): string {
  const s = str.trim().replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, '');
  //console.log("TRIMED:", "<|START|>" + s + "<|END|>");
  return s
}

/**
 * Checks if the given input string contains one and only one occurrence of the specified search value.
 *
 * @param str - The input string to search for the search value.
 * @param searchValue - The search value to look for in the input string.
 * @returns A boolean value indicating whether the input string contains one and only one occurrence of the search value. Or
 * a null value if the input string does not contain any occureence of the search value
 *
 * @example
 * const inputString = "abcxyzdefxyz";
 * const searchValue = "xyz";
 * const result = containsOneOccurrence(inputString, searchValue);
 * console.log(result); // Output: false
 */
function containsOneOccurrence(str: string, searchValue: string): boolean | null {
  const index = str.indexOf(searchValue);
  if (index === -1) {
    return null;
  }
  const lastIndex = str.lastIndexOf(searchValue);
  return index === lastIndex;
}

export { extractCodeBetweenTags, trimStr, containsOneOccurrence }