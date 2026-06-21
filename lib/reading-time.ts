export function estimateReadingTime(body: any[] | undefined): number {
  if (!body) return 1;
  let text = "";
  for (const block of body) {
    if (block._type === "block" && Array.isArray(block.children)) {
      for (const child of block.children) {
        if (child.text) text += child.text + " ";
      }
    }
  }
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
