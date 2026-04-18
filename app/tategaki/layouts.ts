import { layoutWithLines } from "@chenglou/pretext";

import type { Grapheme } from "./metrics";
import { getPreparedHorizontal } from "./metrics";
import { isLatinOrDigit } from "./unicode";

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

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

// -------------------------------------------------------------------------
// Implementations
// -------------------------------------------------------------------------

/**
 * Vertical (tategaki). Hard breaks (\n) force a new column. Latin runs
 * step by their advance so "17" reads tightly stacked instead of each
 * sitting in a full CJK em cell.
 */
export const vertical: LayoutFn = (graphemes, { w, h }, { fontSize, lineHeight }) => {
  const padY = fontSize * 1.2;
  const lineGap = fontSize * lineHeight;
  const charAdvance = fontSize * 1.05;
  const columnBottom = h - padY;

  const stepOf = (g: Grapheme): number => {
    if (g.char === "\n") return 0;
    if (isLatinOrDigit(g.char)) return (g.advance || fontSize) * 1.05;
    return charAdvance;
  };

  // First pass — count columns so we can center the whole block horizontally.
  let colCount = 1;
  {
    let y = padY;
    for (const g of graphemes) {
      if (g.char === "\n") {
        colCount += 1;
        y = padY;
        continue;
      }
      const step = stepOf(g);
      if (y + step > columnBottom) {
        colCount += 1;
        y = padY;
      }
      y += step;
    }
  }

  const blockWidth = colCount * lineGap;
  const rightAnchor = (w + blockWidth) / 2;

  // Second pass — emit positions. CSS handles glyph orientation; layout
  // only concerns itself with cell placement.
  const positions: Position[] = Array.from(
    { length: graphemes.length },
    () => ({ x: 0, y: 0, rotation: 0 }),
  );
  let col = 0;
  let y = padY;

  for (let i = 0; i < graphemes.length; i++) {
    const g = graphemes[i]!;
    if (g.char === "\n") {
      col += 1;
      y = padY;
      continue;
    }
    const step = stepOf(g);
    if (y + step > columnBottom) {
      col += 1;
      y = padY;
    }
    const adv = g.advance || fontSize;
    const colCenterX = rightAnchor - col * lineGap;
    positions[i] = {
      x: colCenterX - adv / 2,
      y: y - fontSize / 2,
      rotation: 0,
    };
    y += step;
  }

  return positions;
};

/**
 * Horizontal. Pretext computes line breaks at the same font/width the
 * browser would, and each glyph is placed by its cached advance.
 * Treats `\n` as a hard break.
 */
export const horizontal: LayoutFn = (graphemes, { w }, { fontSize, lineHeight, fontFamily }) => {
  if (graphemes.length === 0) return [];

  const padX = fontSize * 1.4;
  const padY = fontSize * 1.2;
  const lh = fontSize * lineHeight;
  const maxWidth = Math.max(fontSize, w - padX * 2);

  const text = graphemes.map(g => g.char).join("");
  const font = `${fontSize}px ${fontFamily}`;

  let lines: { text: string }[];
  try {
    lines = layoutWithLines(getPreparedHorizontal(text, font), maxWidth, lh).lines;
  }
  catch {
    lines = [{ text }];
  }

  const positions: Position[] = Array.from(
    { length: graphemes.length },
    () => ({ x: 0, y: 0, rotation: 0 }),
  );
  let gi = 0;
  let y = padY;

  const skipHardBreaks = (): void => {
    while (gi < graphemes.length) {
      const ch = graphemes[gi]!.char;
      if (ch !== "\n" && ch !== "\r") break;
      gi += 1;
    }
  };

  for (const line of lines) {
    skipHardBreaks();
    let x = padX;
    for (const _seg of segmenter.segment(line.text)) {
      if (gi >= graphemes.length) break;
      const g = graphemes[gi]!;
      positions[gi] = { x, y: y - fontSize / 2, rotation: 0 };
      x += g.advance || fontSize;
      gi += 1;
      void _seg;
    }
    y += lh;
  }
  while (gi < graphemes.length) {
    positions[gi] = { x: padX, y: y - fontSize / 2, rotation: 0 };
    gi += 1;
  }
  return positions;
};

// Normalise a rotation to (-π/2, π/2] so chars never end up upside down.
// Anything past ±π/2 is flipped by π which keeps it readable from above.
const clampReadable = (rot: number): number => {
  let v = ((rot + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (v > Math.PI / 2) v -= Math.PI;
  else if (v < -Math.PI / 2) v += Math.PI;
  return v;
};

type ArcIndex = {
  totalArc: number;
  angleAt: (_targetArc: number) => number;
};

// Numerically integrate arc length along the Archimedean spiral r = dr·θ,
// then binary-search the θ that lands at a target arc length.
const buildArcIndex = (dr: number, thetaMax: number, samples = 400): ArcIndex => {
  const dTheta = thetaMax / samples;
  const cumulative: number[] = [0];
  const thetas: number[] = [0];
  let arc = 0;
  for (let i = 1; i <= samples; i++) {
    const th = i * dTheta;
    const r = th * dr;
    const ds = Math.hypot(r, dr) * dTheta;
    arc += ds;
    cumulative.push(arc);
    thetas.push(th);
  }
  const angleAt = (targetArc: number): number => {
    let lo = 0;
    let hi = samples;
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
  return { totalArc: arc, angleAt };
};

/**
 * Spiral — unfolds from center outward, chars at equal arc-length increments
 * so inner and outer turns hold characters at the same visual spacing.
 * Rotations are clamped to ±π/2 so no char ends up upside down.
 */
export const spiral: LayoutFn = (graphemes, { w, h }, { fontSize }) => {
  const cx = w / 2;
  const cy = h / 2;
  const pad = fontSize * 0.4;
  const outerR = Math.max(fontSize * 3, Math.min(w, h) / 2 - pad);

  const n = graphemes.reduce((acc, g) => acc + (g.char === "\n" ? 0 : 1), 0);
  if (n === 0) return graphemes.map(() => ({ x: cx, y: cy, rotation: 0 }));

  const charStep = fontSize * 1.08;
  const turns = Math.max(1.5, Math.min(4, (n * charStep) / (outerR * Math.PI * 1.4)));
  const thetaMax = Math.PI * 2 * turns;
  const dr = outerR / thetaMax;
  const { totalArc, angleAt } = buildArcIndex(dr, thetaMax);

  let idx = 0;
  return graphemes.map((g) => {
    if (g.char === "\n") return { x: 0, y: 0, rotation: 0 };
    const target = ((idx + 0.5) / n) * totalArc;
    idx += 1;
    const theta = angleAt(target);
    const r = theta * dr;
    const angle = -theta - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r - fontSize / 2,
      y: cy + Math.sin(angle) * r - fontSize / 2,
      rotation: clampReadable(angle - Math.PI / 2),
    };
  });
};

// Seeded pseudo-random in [0, 1). Deterministic per (i, salt, seed) triple so
// re-renders at the same seed land in the same place.
const rand = (i: number, salt: number, seed: number): number => {
  const s = Math.sin((i + 1) * 12.9898 + salt * 78.233 + seed * 37.719) * 43758.5453;
  return s - Math.floor(s);
};

export const scatter: LayoutFn = (graphemes, { w, h }, { fontSize, seed = 0 }) => {
  const pad = fontSize * 1.8;
  const usableW = Math.max(0, w - pad * 2);
  const usableH = Math.max(0, h - pad * 2);

  return graphemes.map((g, i) => {
    if (g.char === "\n") return { x: 0, y: 0, rotation: 0 };
    return {
      x: pad + rand(i, 1, seed) * usableW - fontSize / 2,
      y: pad + rand(i, 2, seed) * usableH - fontSize / 2,
      rotation: (rand(i, 3, seed) - 0.5) * 0.5,
    };
  });
};

export const LAYOUTS = { vertical, horizontal, spiral, scatter } as const;

export type ModeKey = keyof typeof LAYOUTS;
