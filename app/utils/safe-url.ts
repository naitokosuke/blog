/**
 * Narrows a URL to the http(s) schemes before it reaches an `src` / `href`.
 *
 * Link cards render whatever `og:image` / `og:url` the fetched page advertises,
 * and prose images render whatever an author wrote, so these bindings are not
 * necessarily trusted. Anything that is not http(s) — `javascript:` above all —
 * becomes an empty string. Relative URLs resolve against a dummy base, so they
 * pass through unchanged.
 */
export function safeUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const { protocol } = new URL(url, "http://localhost");
    return protocol === "http:" || protocol === "https:" ? url : "";
  } catch {
    return "";
  }
}
