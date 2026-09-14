export function createLineSplitter(): { push(chunk: string): string[]; flush(): string[] } {
  let buffer = "";
  return {
    push(chunk) {
      buffer += chunk;
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";
      return parts.filter((part) => part.trim() !== "");
    },
    flush() {
      const rest = buffer.trim();
      buffer = "";
      return rest ? [rest] : [];
    },
  };
}
