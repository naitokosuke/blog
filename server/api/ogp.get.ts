import type { DefaultTreeAdapterMap } from "parse5";
import { parse } from "parse5";

type Element = DefaultTreeAdapterMap["element"];
type ChildNode = DefaultTreeAdapterMap["childNode"];

interface OgpData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  favicon: string;
}

function isElement(node: ChildNode): node is Element {
  return node.nodeName !== "#text" && node.nodeName !== "#comment" && "tagName" in node;
}

function findElements(node: { childNodes?: ChildNode[] }, tagName: string): Element[] {
  const results: Element[] = [];
  if (!node.childNodes) return results;
  for (const child of node.childNodes) {
    if (isElement(child)) {
      if (child.tagName === tagName) {
        results.push(child);
      }
      results.push(...findElements(child, tagName));
    }
  }
  return results;
}

function getAttr(el: Element, name: string): string | undefined {
  return el.attrs.find(a => a.name === name)?.value;
}

function getTextContent(el: Element): string {
  let text = "";
  if (!el.childNodes) return text;
  for (const child of el.childNodes) {
    if (child.nodeName === "#text" && "value" in child) {
      text += child.value;
    }
    else if (isElement(child)) {
      text += getTextContent(child);
    }
  }
  return text;
}

function resolveUrl(base: string, relative: string): string {
  if (!relative) return "";
  try {
    return new URL(relative, base).href;
  }
  catch {
    return relative;
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url as string | undefined;

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: "Missing 'url' query parameter" });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid URL" });
  }

  let html: string;
  try {
    html = await $fetch<string>(url, {
      headers: {
        "User-Agent": "bot",
        "Accept": "text/html",
      },
      timeout: 5000,
      responseType: "text",
    });
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: "Failed to fetch the target URL" });
  }

  const document = parse(html);
  const metaElements = findElements(document, "meta");
  const titleElements = findElements(document, "title");

  const ogTags: Record<string, string> = {};
  for (const meta of metaElements) {
    const property = getAttr(meta, "property") || getAttr(meta, "name");
    const content = getAttr(meta, "content");
    if (property && content) {
      ogTags[property] = content;
    }
  }

  const fallbackTitle = titleElements.length > 0 ? getTextContent(titleElements[0]!) : "";

  const ogImage = ogTags["og:image"] || "";
  const resolvedImage = ogImage ? resolveUrl(url, ogImage) : "";

  const data: OgpData = {
    title: ogTags["og:title"] || fallbackTitle,
    description: ogTags["og:description"] || ogTags["description"] || "",
    image: resolvedImage,
    url: ogTags["og:url"] || url,
    siteName: ogTags["og:site_name"] || parsedUrl.hostname,
    favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`,
  };

  return data;
});
