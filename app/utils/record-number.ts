/**
 * 3 -> "記録 003": the number a post is filed under, counted from the oldest.
 * Zero-padded so the column of numbers on the index lines up.
 */
export function formatRecordNumber(number: number): string {
  return `記録 ${String(number).padStart(3, "0")}`;
}

/**
 * A post's record number from its index in the newest-first post list, or
 * undefined when it is not in the list (a docs page, an unknown path).
 */
export function recordNumberAt(index: number, total: number): number | undefined {
  return index === -1 ? undefined : total - index;
}
