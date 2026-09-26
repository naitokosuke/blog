// Builds a Zen Old Mincho subset that holds exactly the glyphs this site
// renders, and writes the @font-face rules that point at it.
//
// Why: @nuxt/fonts serves the family through Google's unicode-range split,
// where every ~340-glyph subset file is pulled in full for as little as one
// glyph. Measured on this site, an article fetches 270-700 KB of woff2 to draw
// 80-580 distinct characters, and the whole site needs 941 KB for 865 glyphs.
// Cutting the family down to the ~980 characters the site actually writes
// costs 247 KB in total, about 250 bytes a glyph.
//
// That total is still more than a short post used to pay, so the glyphs are
// not shipped as one file: the core holds what every page needs, and each post
// gets a bucket for the characters only it uses. A page then fetches the core
// plus one small file - 137-169 KB measured, against 132-700 KB before - and a
// reader moving through the site never re-fetches the core.
//
// The generated rules are declared after main.css, so for a covered character
// the browser picks this file (later @font-face wins) and anything outside it
// - a link card's remote title, a draft written after the last run - still
// resolves through the Google subsets that @nuxt/fonts injects. That fallback
// is why a stale subset renders correctly, it only costs the extra fetch.
//
// Run it after adding content: build, then `vp run font:subset`, then build
// again so the new files are hashed into the output. Skipping the first build
// only widens the split, it does not break anything.

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FAMILY = "Zen Old Mincho";
const WEIGHT = 400;

// Posts carry most of the vocabulary; the rest of the source is the UI chrome,
// which is on every page. Source files drag in ASCII from code, which is
// harmless: Latin glyphs are a rounding error next to kanji, and the body font
// draws them too.
const CONTENT_DIR = "content";
const CHROME_DIRS = ["app", "components", "server"];
const CHROME = "core";
const SOURCE_EXTENSIONS = new Set([".md", ".vue", ".ts", ".yml", ".yaml", ".json"]);

const FONT_DIR = join(ROOT, "public/fonts");
const FONT_URL_BASE = "/fonts";
const FONT_PREFIX = "zen-old-mincho";
const CSS_OUT = join(ROOT, "app/assets/css/font-subset.css");

// Google refuses very long URLs, so the request is split. Chunks are grouped by
// script first so one request never spans two of Google's own subsets, which
// would come back as several @font-face rules we could not attribute.
const CHUNK_SIZE = 250;

// Google serves woff2 only to a browser that advertises support
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

async function collectFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectFiles(path)));
    else if (SOURCE_EXTENSIONS.has(extname(entry.name))) out.push(path);
  }
  return out;
}

async function readCodepoints(file) {
  const out = new Set();
  for (const char of await readFile(file, "utf8")) {
    const cp = char.codePointAt(0);
    // Control characters and whitespace need no outline
    if (cp <= 0x20 || cp === 0x7f) continue;
    out.add(cp);
  }
  return out;
}

/**
 * Which pages a codepoint appears on, read from a previous build.
 *
 * The source alone cannot answer this. A post's title is written in its own
 * markdown but is also listed on the index, and a link card renders a title
 * fetched from the remote page, which exists in no file here. Both would land
 * in one post's bucket - or in no bucket at all - and the pages that need them
 * would fall back to a full Google subset. The rendered HTML has the final
 * text, so when a build is around, it decides the split.
 */
async function collectRenderedOwners(record) {
  const dir = join(ROOT, ".output/public");
  const walk = async (current) => {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return [];
    }
    const found = [];
    for (const entry of entries) {
      if (entry.name.startsWith("_")) continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) found.push(...(await walk(path)));
      else if (entry.name === "index.html") found.push(path);
    }
    return found;
  };

  const pages = await walk(dir);
  for (const page of pages) {
    const rest = page.slice(dir.length + 1);
    const slug = rest === "index.html" ? "index" : rest.slice(0, rest.indexOf("/"));
    const text = (await readFile(page, "utf8"))
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ");
    for (const char of text) {
      const cp = char.codePointAt(0);
      if (cp <= 0x20 || cp === 0x7f) continue;
      record(cp, slug);
    }
  }
  return pages.length;
}

/** Which post (or the chrome) each codepoint comes from. */
async function collectOwners() {
  const owners = new Map();
  let files = 0;
  const record = (cp, owner) => {
    let set = owners.get(cp);
    if (!set) owners.set(cp, (set = new Set()));
    set.add(owner);
  };

  for (const dir of CHROME_DIRS) {
    for (const file of await collectFiles(join(ROOT, dir))) {
      files++;
      for (const cp of await readCodepoints(file)) record(cp, CHROME);
    }
  }
  for (const file of await collectFiles(join(ROOT, CONTENT_DIR))) {
    files++;
    // content/<slug>/index.md and content/<slug>.md both belong to <slug>
    const rest = file.slice(join(ROOT, CONTENT_DIR).length + 1);
    const slug = rest.includes("/") ? rest.slice(0, rest.indexOf("/")) : rest.replace(/\.\w+$/, "");
    for (const cp of await readCodepoints(file)) record(cp, slug);
  }

  const pages = await collectRenderedOwners(record);
  return { owners, files, pages };
}

/**
 * Split the glyphs into a core every page needs and one bucket per post.
 *
 * A glyph that only one post uses goes in that post's bucket, so reading one
 * article pulls the core plus a single small file instead of the whole site's
 * vocabulary. Anything shared - the chrome, or a character two posts both use
 * - goes in the core, since splitting it further would only mean more files
 * for the same bytes.
 */
function bucketByOwner(owners, coverage) {
  const buckets = new Map([[CHROME, []]]);
  for (const [cp, used] of owners) {
    if (!coverage.has(cp)) continue;
    const [only] = used;
    const bucket = used.size === 1 && only !== CHROME ? only : CHROME;
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(cp);
  }
  return buckets;
}

function parseUnicodeRange(value) {
  const ranges = [];
  for (const part of value.split(",")) {
    const token = part.trim().replace(/^U\+/i, "");
    if (token.includes("-")) {
      const [from, to] = token.split("-");
      ranges.push([Number.parseInt(from, 16), Number.parseInt(to, 16)]);
    } else if (token.includes("?")) {
      ranges.push([
        Number.parseInt(token.replaceAll("?", "0"), 16),
        Number.parseInt(token.replaceAll("?", "F"), 16),
      ]);
    } else {
      const cp = Number.parseInt(token, 16);
      ranges.push([cp, cp]);
    }
  }
  return ranges;
}

function formatUnicodeRange(codepoints) {
  const sorted = [...codepoints].sort((a, b) => a - b);
  const parts = [];
  let start = sorted[0];
  let previous = sorted[0];
  const push = () => {
    const from = start.toString(16).toUpperCase();
    parts.push(
      start === previous ? `U+${from}` : `U+${from}-${previous.toString(16).toUpperCase()}`,
    );
  };
  for (const cp of sorted.slice(1)) {
    if (cp === previous + 1) {
      previous = cp;
      continue;
    }
    push();
    start = cp;
    previous = cp;
  }
  push();
  return parts.join(",");
}

async function fetchCss(url) {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.text();
}

function faceBlocks(css) {
  return (css.match(/@font-face\s*\{[^}]*\}/g) ?? []).map((block) => ({
    url: block.match(/url\((['"]?)([^'")]+)\1\)/)?.[2],
    unicodeRange: block.match(/unicode-range:\s*([^;}]+)/)?.[1]?.trim(),
  }));
}

// Every codepoint the family actually has an outline for. Claiming more in a
// unicode-range would send the browser to a file without the glyph, and it
// would fall through to the system serif instead of the next subset.
async function fetchCoverage() {
  const css = await fetchCss(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FAMILY)}:wght@${WEIGHT}&display=swap`,
  );
  const coverage = new Set();
  for (const face of faceBlocks(css)) {
    if (!face.unicodeRange) continue;
    for (const [from, to] of parseUnicodeRange(face.unicodeRange)) {
      for (let cp = from; cp <= to; cp++) coverage.add(cp);
    }
  }
  if (coverage.size === 0) throw new Error("no unicode-range found in the Google stylesheet");
  return coverage;
}

// Keep Latin, punctuation/symbols and CJK in separate requests
function scriptGroup(cp) {
  if (cp < 0x0500) return 0;
  if (cp < 0x3000) return 1;
  return 2;
}

function chunkCodepoints(codepoints) {
  const groups = new Map();
  for (const cp of [...codepoints].sort((a, b) => a - b)) {
    const key = scriptGroup(cp);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(cp);
  }
  const chunks = [];
  for (const group of [...groups.keys()].sort()) {
    const list = groups.get(group);
    for (let i = 0; i < list.length; i += CHUNK_SIZE) chunks.push(list.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

async function downloadChunk(codepoints, label) {
  const text = String.fromCodePoint(...codepoints);
  const css = await fetchCss(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FAMILY)}:wght@${WEIGHT}` +
      `&text=${encodeURIComponent(text)}&display=swap`,
  );
  const faces = faceBlocks(css).filter((face) => face.url);
  if (faces.length !== 1) {
    throw new Error(
      `chunk ${label} came back as ${faces.length} font files; lower CHUNK_SIZE and retry`,
    );
  }
  const response = await fetch(faces[0].url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} downloading ${faces[0].url}`);
  const body = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 8);
  const name = `${FONT_PREFIX}-${label}.${hash}.woff2`;
  await writeFile(join(FONT_DIR, name), body);
  return { name, bytes: body.length, codepoints };
}

function renderCss(files) {
  const rules = files.map(
    (file) => `@font-face {
  font-family: "${FAMILY}";
  src:
    local("${FAMILY} Regular"), local("${FAMILY}"),
    url("${FONT_URL_BASE}/${file.name}") format("woff2");
  font-weight: ${WEIGHT};
  font-style: normal;
  font-display: swap;
  unicode-range: ${formatUnicodeRange(file.codepoints)};
}`,
  );

  return `/* Generated by scripts/build-font-subset.mjs -- do not edit by hand.
 *
 * ${FAMILY} cut down to the glyphs this site renders, as a core every page
 * needs plus one bucket per post holding the characters only that post uses.
 * Loaded after main.css so these rules win over the Google subsets
 * @nuxt/fonts injects there; a
 * character outside this subset (a link card's remote title, a post added
 * since the last run) still resolves through those, so a stale file renders
 * correctly and only costs the extra fetch. Regenerate with:
 *
 *   vp run font:subset
 */

${rules.join("\n\n")}
`;
}

async function removeStaleFonts(keep) {
  let removed = 0;
  for (const name of await readdir(FONT_DIR)) {
    if (!name.startsWith(`${FONT_PREFIX}-`) || keep.has(name)) continue;
    await unlink(join(FONT_DIR, name));
    removed++;
  }
  return removed;
}

async function main() {
  const { owners, files, pages } = await collectOwners();
  const coverage = await fetchCoverage();
  const buckets = bucketByOwner(owners, coverage);
  const wanted = [...buckets.values()].reduce((sum, list) => sum + list.length, 0);

  await mkdir(FONT_DIR, { recursive: true });
  await mkdir(dirname(CSS_OUT), { recursive: true });

  const written = [];
  for (const [bucket, codepoints] of buckets) {
    const chunks = chunkCodepoints(codepoints);
    for (const [index, chunk] of chunks.entries()) {
      const label = chunks.length > 1 ? `${bucket}-${index + 1}` : bucket;
      written.push(await downloadChunk(chunk, label));
    }
  }

  await writeFile(CSS_OUT, renderCss(written));
  const removed = await removeStaleFonts(new Set(written.map((file) => file.name)));

  const total = written.reduce((sum, file) => sum + file.bytes, 0);
  console.log(
    `scanned ${files} files${pages > 0 ? ` and ${pages} prerendered pages` : " (no build output; run a build first for a tighter split)"}, ${owners.size} distinct characters`,
  );
  console.log(`${wanted} in the family (${owners.size - wanted} outside it, left to the fallback)`);
  for (const file of written) {
    console.log(
      `  ${file.name.padEnd(48)} ${String(file.codepoints.length).padStart(4)} glyphs  ${String(Math.round(file.bytes / 1024)).padStart(3)} KB`,
    );
  }
  console.log(`total ${Math.round(total / 1024)} KB in ${written.length} file(s)`);
  if (removed > 0) console.log(`removed ${removed} stale file(s)`);
}

await main();
