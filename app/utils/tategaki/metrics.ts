import { prepareWithSegments, layoutWithLines, type LayoutLine } from "@chenglou/pretext";

export type Grapheme = {
  char: string;
  advance: number;
};

type FontCache = Map<string, number>;

let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;
const advanceCache = new Map<string, FontCache>();
let segmenter: Intl.Segmenter | null = null;

function getSegmenter(): Intl.Segmenter {
  if (!segmenter) {
    segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  }
  return segmenter;
}

function getCtx(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  if (ctx) return ctx;
  if (typeof OffscreenCanvas !== "undefined") {
    ctx = new OffscreenCanvas(1, 1).getContext("2d")!;
  }
  else {
    const el = document.createElement("canvas");
    ctx = el.getContext("2d")!;
  }
  return ctx;
}

/**
 * Per-grapheme advance using Intl.Segmenter + canvas measureText.
 * Same ground truth that Pretext uses internally, but exposed per grapheme
 * so circle / spiral / scatter layouts can distribute along arc length.
 */
export function measureGraphemes(text: string, font: string): Grapheme[] {
  const seg = getSegmenter();
  const c = getCtx();
  c.font = font;
  let cache = advanceCache.get(font);
  if (!cache) {
    cache = new Map();
    advanceCache.set(font, cache);
  }
  const out: Grapheme[] = [];
  for (const s of seg.segment(text)) {
    let adv = cache.get(s.segment);
    if (adv === undefined) {
      adv = c.measureText(s.segment).width;
      cache.set(s.segment, adv);
    }
    out.push({ char: s.segment, advance: adv });
  }
  return out;
}

/**
 * Horizontal flow line layout via Pretext. Used by CanvasRenderer when
 * drawing horizontal text without DOM. Returns precomputed lines with
 * widths and cursor ranges.
 */
export function measureHorizontalFlow(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
): LayoutLine[] {
  const prep = prepareWithSegments(text, font, { wordBreak: "keep-all" });
  return layoutWithLines(prep, maxWidth, lineHeight).lines;
}

export function clearMetricsCache(): void {
  advanceCache.clear();
}
