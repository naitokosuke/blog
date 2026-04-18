import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import type { Grapheme } from "./metrics";

export type Position = {
  x: number;
  y: number;
  rotation: number;
};

export type Bounds = { w: number; h: number };

export type LayoutOpts = {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  seed?: number;
};

export type LayoutFn = (
  _graphemes: Grapheme[],
  _bounds: Bounds,
  _opts: LayoutOpts,
) => Position[];

const rand = (i: number, salt: number, seed: number): number => {
  const s = Math.sin((i + 1) * 12.9898 + salt * 78.233 + seed * 37.719) * 43758.5453;
  return s - Math.floor(s);
};

// Glyphs that need 90° CW rotation in vertical writing (the font's
// native glyphs assume horizontal flow; we swap them for tategaki by
// rotating the span itself).
const VERT_ROTATE = new Set<string>([
  "「", "」", "『", "』",
  "（", "）", "(", ")",
  "［", "］", "[", "]",
  "【", "】", "〔", "〕",
  "〈", "〉", "《", "》",
  "{", "}", "｛", "｝",
  "<", ">", "＜", "＞",
  "ー", "〜", "～",
  "—", "–", "−", "-",
  "…", "‥",
]);

// Punctuation that lives at the top-right of its em-box in vertical text
// rather than centered. Shift position by ~0.3em up-right from the cell center.
const VERT_CORNER_PUNCT = new Set<string>([
  "。", "、", "，", "．", "：", "；", ",", ".",
]);

// Latin letters and digits: follow `text-orientation: mixed` and rotate
// 90° CW so they flow down the column instead of standing upright.
const isLatinOrDigit = (ch: string): boolean => {
  if (ch.length !== 1) return false;
  const c = ch.charCodeAt(0);
  return (c >= 0x30 && c <= 0x39) // 0-9
    || (c >= 0x41 && c <= 0x5a) // A-Z
    || (c >= 0x61 && c <= 0x7a); // a-z
};

/**
 * Vertical (tategaki) — right-to-left columns, top-to-bottom within column.
 * Hard breaks (\n in the text) force a new column. vAdvance uses em-square
 * for CJK so chars stack at natural metrics.
 */
export const vertical: LayoutFn = (graphemes, { w, h }, { fontSize, lineHeight }) => {
  const padX = fontSize * 1.6;
  const padY = fontSize * 1.2;
  const lineGap = fontSize * lineHeight;
  const charAdvance = fontSize * 1.05;
  const columnBottom = h - padY;
  const cornerShift = fontSize * 0.3;

  const positions: Position[] = [];
  let col = 0;
  let y = padY;

  for (const g of graphemes) {
    if (g.char === "\n") {
      col += 1;
      y = padY;
      positions.push({ x: 0, y: 0, rotation: 0 });
      continue;
    }
    if (y + charAdvance > columnBottom) {
      col += 1;
      y = padY;
    }
    const ch = g.char;
    const rotation = VERT_ROTATE.has(ch) || isLatinOrDigit(ch) ? Math.PI / 2 : 0;
    let ox = 0;
    let oy = 0;
    if (VERT_CORNER_PUNCT.has(ch)) {
      ox = cornerShift;
      oy = -cornerShift;
    }
    positions.push({
      x: w - padX - col * lineGap - fontSize / 2 + ox,
      y: y - fontSize / 2 + oy,
      rotation,
    });
    y += charAdvance;
  }
  return positions;
};

/**
 * Horizontal — line-breaking via Pretext so the break points match what the
 * browser would produce at the same font / width. Per-char positions use the
 * glyph advance cached in `graphemes`. Treats `\n` as a hard break.
 */
export const horizontal: LayoutFn = (graphemes, { w }, opts) => {
  const { fontSize, lineHeight, fontFamily } = opts;
  const padX = fontSize * 1.4;
  const padY = fontSize * 1.2;
  const lh = fontSize * lineHeight;
  const maxWidth = Math.max(fontSize, w - padX * 2);

  if (graphemes.length === 0) return [];

  const text = graphemes.map(g => g.char).join("");
  const font = `${fontSize}px ${fontFamily}`;

  let lines: { text: string }[];
  try {
    const prepared = prepareWithSegments(text, font, {
      whiteSpace: "pre-wrap",
      wordBreak: "keep-all",
    });
    lines = layoutWithLines(prepared, maxWidth, lh).lines;
  }
  catch {
    lines = [{ text }];
  }

  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const positions: Position[] = Array.from({ length: graphemes.length }, () => ({ x: 0, y: 0, rotation: 0 }));
  let gi = 0;
  let y = padY;

  const skipBreakGraphemes = () => {
    while (gi < graphemes.length && (graphemes[gi]!.char === "\n" || graphemes[gi]!.char === "\r")) {
      positions[gi] = { x: 0, y: 0, rotation: 0 };
      gi += 1;
    }
  };

  for (const line of lines) {
    skipBreakGraphemes();
    let x = padX;
    for (const seg of segmenter.segment(line.text)) {
      if (gi >= graphemes.length) break;
      const g = graphemes[gi]!;
      positions[gi] = {
        x: x - fontSize / 2,
        y: y - fontSize / 2,
        rotation: 0,
      };
      x += g.advance || fontSize;
      gi += 1;
      void seg;
    }
    y += lh;
  }
  while (gi < graphemes.length) {
    positions[gi] = { x: padX - fontSize / 2, y: y - fontSize / 2, rotation: 0 };
    gi += 1;
  }
  return positions;
};

/**
 * Spiral — unfolds from center outward along an Archimedean spiral.
 * Chars are placed at equal arc-length increments (numerical integration
 * of ds = sqrt(r^2 + (dr/dθ)^2) dθ) so inner and outer turns hold
 * characters at the same visual spacing. Chars stay upright for readability.
 */
export const spiral: LayoutFn = (graphemes, { w, h }, { fontSize }) => {
  const cx = w / 2;
  const cy = h / 2;
  const pad = fontSize * 0.4;
  const outerR = Math.max(fontSize * 3, Math.min(w, h) / 2 - pad);
  const renderable = graphemes.filter(g => g.char !== "\n");
  const n = renderable.length;
  if (n === 0) return graphemes.map(() => ({ x: cx, y: cy, rotation: 0 }));

  const step = fontSize * 1.08;
  const turns = Math.max(1.5, Math.min(4, (n * step) / (outerR * Math.PI * 1.4)));
  const thetaMax = Math.PI * 2 * turns;
  const dr = outerR / thetaMax;

  const SAMPLES = 400;
  const dTheta = thetaMax / SAMPLES;
  const cumulative: number[] = [0];
  const thetas: number[] = [0];
  let arc = 0;
  for (let i = 1; i <= SAMPLES; i++) {
    const th = i * dTheta;
    const r = th * dr;
    const ds = Math.hypot(r, dr) * dTheta;
    arc += ds;
    cumulative.push(arc);
    thetas.push(th);
  }
  const totalArc = arc;

  const findAngle = (targetArc: number): number => {
    let lo = 0;
    let hi = SAMPLES;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid]! < targetArc) lo = mid + 1;
      else hi = mid;
    }
    const j = Math.max(1, lo);
    const a0 = cumulative[j - 1]!;
    const a1 = cumulative[j]!;
    const t = a1 === a0 ? 0 : (targetArc - a0) / (a1 - a0);
    return thetas[j - 1]! + t * (thetas[j]! - thetas[j - 1]!);
  };

  const clampRot = (r: number): number => {
    let v = ((r + Math.PI) % (2 * Math.PI)) - Math.PI;
    if (v > Math.PI / 2) v -= Math.PI;
    else if (v < -Math.PI / 2) v += Math.PI;
    return v;
  };

  let idx = 0;
  return graphemes.map((g) => {
    if (g.char === "\n") return { x: 0, y: 0, rotation: 0 };
    const target = ((idx + 0.5) / n) * totalArc;
    idx += 1;
    const theta = findAngle(target);
    const r = theta * dr;
    const angle = theta - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r - fontSize / 2,
      y: cy + Math.sin(angle) * r - fontSize / 2,
      rotation: clampRot(angle + Math.PI / 2),
    };
  });
};

export const scatter: LayoutFn = (graphemes, { w, h }, { fontSize, seed = 0 }) => {
  const pad = fontSize * 1.8;
  return graphemes.map((g, i) => {
    if (g.char === "\n") return { x: 0, y: 0, rotation: 0 };
    const rx = rand(i, 1, seed);
    const ry = rand(i, 2, seed);
    const rr = rand(i, 3, seed);
    return {
      x: pad + rx * Math.max(0, w - pad * 2) - fontSize / 2,
      y: pad + ry * Math.max(0, h - pad * 2) - fontSize / 2,
      rotation: (rr - 0.5) * 0.5,
    };
  });
};

export const LAYOUTS = { vertical, horizontal, spiral, scatter } as const;
export type ModeKey = keyof typeof LAYOUTS;
