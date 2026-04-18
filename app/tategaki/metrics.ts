import { clearCache, prepareWithSegments } from "@chenglou/pretext";

import type { PreparedTextWithSegments } from "@chenglou/pretext";

export type Grapheme = {
  char: string;
  advance: number;
};

type AdvanceMap = Map<string, number>;

const MAX_FONTS = 4;

let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;
const advanceCache = new Map<string, AdvanceMap>();

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

const getCtx = (): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D => {
  if (ctx) return ctx;
  if (typeof OffscreenCanvas !== "undefined") {
    ctx = new OffscreenCanvas(1, 1).getContext("2d")!;
  }
  else {
    ctx = document.createElement("canvas").getContext("2d")!;
  }
  return ctx;
};

// LRU-ish trim: Map preserves insertion order, so deleting the oldest key
// evicts the least-recently added font. Called after a new font is added.
const evictOldFonts = (): void => {
  while (advanceCache.size > MAX_FONTS) {
    const oldest = advanceCache.keys().next().value;
    if (oldest === undefined) break;
    advanceCache.delete(oldest);
  }
};

/**
 * Per-grapheme advance using Intl.Segmenter + canvas measureText.
 * Same ground truth that Pretext uses internally, but exposed per grapheme
 * so spiral / scatter layouts can distribute along arc length.
 */
export const measureGraphemes = (text: string, font: string): Grapheme[] => {
  const c = getCtx();
  c.font = font;
  let advances = advanceCache.get(font);
  if (!advances) {
    advances = new Map();
    advanceCache.set(font, advances);
    evictOldFonts();
  }
  const out: Grapheme[] = [];
  for (const s of segmenter.segment(text)) {
    let adv = advances.get(s.segment);
    if (adv === undefined) {
      adv = c.measureText(s.segment).width;
      advances.set(s.segment, adv);
    }
    out.push({ char: s.segment, advance: adv });
  }
  return out;
};

// Pretext's docs say: do not rerun prepare() for the same text+font+options.
// We memoize the latest prepared handle so re-renders on resize reuse it.
type PreparedKey = { text: string; font: string };
let lastPreparedKey: PreparedKey | null = null;
let lastPrepared: PreparedTextWithSegments | null = null;

export const getPreparedHorizontal = (
  text: string,
  font: string,
): PreparedTextWithSegments => {
  if (lastPrepared && lastPreparedKey?.text === text && lastPreparedKey?.font === font) {
    return lastPrepared;
  }
  lastPrepared = prepareWithSegments(text, font, {
    whiteSpace: "pre-wrap",
    wordBreak: "keep-all",
  });
  lastPreparedKey = { text, font };
  return lastPrepared;
};

export const clearMetricsCache = (): void => {
  advanceCache.clear();
  lastPrepared = null;
  lastPreparedKey = null;
  clearCache();
};
