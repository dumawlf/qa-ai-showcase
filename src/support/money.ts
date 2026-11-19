/**
 * Turns shop text such as "$29.99" or "Item total: $39.98" into cents (2999, 3998).
 * Tests compare cents, because 0.1 + 0.2 is not exactly 0.3 in JavaScript.
 */
export function toCents(text: string): number {
  const match = /\$(\d+)\.(\d{2})/.exec(text);
  if (!match) {
    throw new Error(`No price found in "${text}"`);
  }
  return Number(match[1]) * 100 + Number(match[2]);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
