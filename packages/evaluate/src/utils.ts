function extractCodeBetweenTags(input: string): string | null {
  // Regular expression to match code between markdown tags with any label
  const regex = /```[a-zA-Z]*\s*([\s\S]*?)\s*```/gm;
  const match = regex.exec(input);
  return match ? match[1].trim() : null;
}

export { extractCodeBetweenTags }