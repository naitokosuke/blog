import type { Grapheme } from "../metrics";
import type { Position } from "../layouts";

export type RenderOpts = {
  fontSize: number;
  fontFamily: string;
  color: string;
  transitionMs: number;
  staggerMs: number;
};

export type RenderPayload
  = | { kind: "positioned"; graphemes: Grapheme[]; positions: Position[] }
    | { kind: "idle" };

export interface Renderer {
  mount(_container: HTMLElement, _opts: RenderOpts): void;
  render(_payload: RenderPayload): void;
  resize(_w: number, _h: number): void;
  setOpts(_opts: RenderOpts): void;
  unmount(): void;
}

// cubic-bezier(0.22, 1, 0.36, 1) approximation
export const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);
