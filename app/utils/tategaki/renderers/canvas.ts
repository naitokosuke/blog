import type { Position } from "../layouts";
import { easeOutQuart, type Renderer, type RenderOpts, type RenderPayload } from "./types";

type PositionedState = {
  chars: string[];
  from: Position[];
  to: Position[];
  startedAt: number;
};

/**
 * Canvas 2D renderer. ctx.fillText for every grapheme. Position
 * transitions are interpolated via requestAnimationFrame with
 * cubic-bezier(0.22, 1, 0.36, 1) easing and a per-index stagger.
 * Feature-detects drawElementImage (HTML-in-Canvas, Chromium flag)
 * but primary draw is fillText.
 */
export class CanvasRenderer implements Renderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private opts: RenderOpts | null = null;
  private w = 0;
  private h = 0;
  private dpr = 1;

  private state: PositionedState | null = null;
  private rafId = 0;

  static supportsHtmlInCanvas(): boolean {
    if (typeof HTMLCanvasElement === "undefined") return false;
    const probe = document.createElement("canvas").getContext("2d");
    return !!probe && "drawElementImage" in probe;
  }

  mount(container: HTMLElement, opts: RenderOpts): void {
    this.opts = opts;
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = globalThis.devicePixelRatio || 1;
    this.resize(container.clientWidth, container.clientHeight);
  }

  setOpts(opts: RenderOpts): void {
    this.opts = opts;
    this.draw();
  }

  resize(w: number, h: number): void {
    if (!this.canvas || !this.ctx) return;
    this.w = w;
    this.h = h;
    this.canvas.width = Math.max(1, Math.round(w * this.dpr));
    this.canvas.height = Math.max(1, Math.round(h * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.draw();
  }

  render(payload: RenderPayload): void {
    if (!this.ctx || !this.opts) return;
    if (payload.kind === "idle") {
      this.cancelRaf();
      this.state = null;
      this.clear();
      return;
    }
    const now = performance.now();
    const chars = payload.graphemes.map(g => g.char);
    const from = this.state && this.state.chars.length === chars.length
      ? this.snapshotCurrent(this.state, now)
      : payload.positions.map(p => ({ ...p }));
    this.state = {
      chars,
      from,
      to: payload.positions.map(p => ({ ...p })),
      startedAt: now,
    };
    this.scheduleAnimation();
  }

  private snapshotCurrent(state: PositionedState, now: number): Position[] {
    const { transitionMs, staggerMs } = this.opts!;
    return state.chars.map((_, i) => {
      const elapsed = now - state.startedAt - i * staggerMs;
      const raw = Math.max(0, Math.min(1, elapsed / transitionMs));
      const t = easeOutQuart(raw);
      const f = state.from[i];
      const to = state.to[i];
      if (!f || !to) return to || f || { x: 0, y: 0, rotation: 0 };
      return {
        x: f.x + (to.x - f.x) * t,
        y: f.y + (to.y - f.y) * t,
        rotation: f.rotation + (to.rotation - f.rotation) * t,
      };
    });
  }

  private scheduleAnimation(): void {
    this.cancelRaf();
    const step = () => {
      this.draw();
      if (this.isAnimating()) {
        this.rafId = requestAnimationFrame(step);
      }
    };
    this.rafId = requestAnimationFrame(step);
  }

  private isAnimating(): boolean {
    if (!this.state || !this.opts) return false;
    const { transitionMs, staggerMs } = this.opts;
    const total = transitionMs + staggerMs * Math.max(0, this.state.chars.length - 1);
    return performance.now() - this.state.startedAt < total;
  }

  private cancelRaf(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private clear(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx || !this.opts || !this.state) {
      this.clear();
      return;
    }
    this.clear();
    const { fontSize, fontFamily, color, transitionMs, staggerMs } = this.opts;
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    const now = performance.now();
    const { chars, from, to, startedAt } = this.state;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]!;
      if (ch === "\n" || ch === "\r") continue;
      const elapsed = now - startedAt - i * staggerMs;
      const raw = Math.max(0, Math.min(1, elapsed / transitionMs));
      const t = easeOutQuart(raw);
      const f = from[i];
      const dst = to[i];
      if (!f || !dst) continue;
      const x = f.x + (dst.x - f.x) * t;
      const y = f.y + (dst.y - f.y) * t;
      const rot = f.rotation + (dst.rotation - f.rotation) * t;
      ctx.save();
      ctx.translate(x + fontSize / 2, y + fontSize / 2);
      if (rot !== 0) ctx.rotate(rot);
      ctx.fillText(ch, -fontSize / 2, -fontSize / 2);
      ctx.restore();
    }
  }

  unmount(): void {
    this.cancelRaf();
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    this.ctx = null;
    this.state = null;
  }
}
