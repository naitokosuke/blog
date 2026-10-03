/**
 * "2026-01-19" or "2026-01-19T00:00:00.000Z" -> "2026.01.19", the log-style
 * date the index and article headers print. Returns "" for a missing date.
 */
export function formatDate(date: string | undefined): string {
  return date?.split("T")[0]?.replaceAll("-", ".") ?? "";
}

/** The YYYY-MM-DD part, for a <time datetime> attribute. */
export function isoDate(date: string | undefined): string {
  return date?.split("T")[0] ?? "";
}
