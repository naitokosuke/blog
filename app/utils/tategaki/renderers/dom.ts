import type { Renderer, RenderOpts, RenderPayload } from "./types";

/**
 * DOM renderer: one absolute-positioned <span> per grapheme. Same spans
 * are reused across mode changes so CSS transitions morph them smoothly.
 */
export class DomRenderer implements Renderer {
  private stage: HTMLDivElement | null = null;
  private spans: HTMLSpanElement[] = [];
  private opts: RenderOpts | null = null;

  mount(container: HTMLElement, opts: RenderOpts): void {
    this.opts = opts;
    const stage = document.createElement("div");
    stage.style.position = "absolute";
    stage.style.inset = "0";
    container.appendChild(stage);
    this.stage = stage;
  }

  setOpts(opts: RenderOpts): void {
    this.opts = opts;
  }

  render(payload: RenderPayload): void {
    if (!this.stage || !this.opts) return;
    if (payload.kind === "idle") {
      this.clearSpans();
      return;
    }
    const { graphemes, positions } = payload;
    const { fontSize, fontFamily, color, transitionMs, staggerMs } = this.opts;

    while (this.spans.length < graphemes.length) {
      const s = document.createElement("span");
      s.style.position = "absolute";
      s.style.top = "0";
      s.style.left = "0";
      s.style.transformOrigin = "center";
      s.style.willChange = "transform";
      s.style.userSelect = "none";
      s.style.pointerEvents = "none";
      s.style.lineHeight = "1";
      this.spans.push(s);
      this.stage.appendChild(s);
    }
    while (this.spans.length > graphemes.length) {
      this.spans.pop()!.remove();
    }

    for (let i = 0; i < graphemes.length; i++) {
      const s = this.spans[i]!;
      const p = positions[i]!;
      const ch = graphemes[i]!.char;
      const isBreak = ch === "\n" || ch === "\r";
      s.textContent = isBreak ? "" : ch;
      s.style.fontSize = `${fontSize}px`;
      s.style.fontFamily = fontFamily;
      s.style.color = color;
      s.style.transition = `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      s.style.transitionDelay = `${i * staggerMs}ms`;
      s.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}rad)`;
    }
  }

  private clearSpans(): void {
    for (const s of this.spans) s.remove();
    this.spans = [];
  }

  resize(): void {
    // CSS handles layout; positions are absolute pixel values.
  }

  unmount(): void {
    this.clearSpans();
    if (this.stage) {
      this.stage.remove();
      this.stage = null;
    }
  }
}
