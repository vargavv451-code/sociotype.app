/** Перетворює багаторядковий рядок на масив тез (по одній на рядок). */
export const L = (s: string): string[] =>
  s
    .trim()
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
