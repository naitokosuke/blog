<script setup lang="ts">
import { measureGraphemes } from "~/utils/tategaki/metrics";
import { LAYOUTS, type ModeKey, type Position } from "~/utils/tategaki/layouts";
import { DomRenderer } from "~/utils/tategaki/renderers/dom";
import { CanvasRenderer } from "~/utils/tategaki/renderers/canvas";
import type { Renderer, RenderOpts, RenderPayload } from "~/utils/tategaki/renderers/types";

type RendererKey = "dom" | "canvas";

const MODES: { key: ModeKey; jp: string }[] = [
  { key: "vertical", jp: "縦" },
  { key: "horizontal", jp: "横" },
  { key: "spiral", jp: "螺旋" },
  { key: "scatter", jp: "散" },
];

const MAX_CHARS = 2000;
const FONT_FAMILY = "\"Zen Old Mincho\", ui-serif, serif";
const LINE_HEIGHT = 1.9;
const TRANSITION_MS = 900;
const STAGGER_MS = 12;

const props = withDefaults(
  defineProps<{
    text?: string;
    editable?: boolean;
    mode?: ModeKey;
  }>(),
  {
    text: "",
    editable: false,
    mode: "vertical",
  },
);

const slotHostRef = ref<HTMLDivElement | null>(null);
const slotText = ref("");

function extractSlotText(host: HTMLElement): string {
  if (host.children.length === 0) {
    return host.textContent?.trim() ?? "";
  }
  const parts: string[] = [];
  for (const child of Array.from(host.children)) {
    const t = (child.textContent ?? "").trim();
    if (t) parts.push(t);
  }
  return parts.join("\n");
}

const text = ref(props.text);
watch(() => props.text, (v) => {
  if (!slotText.value) text.value = v;
});

const current = ref<ModeKey>(props.mode);
const rendererKind = ref<RendererKey>("dom");
const seed = ref(0);

const stageRef = ref<HTMLDivElement | null>(null);
const rendererRef = ref<HTMLDivElement | null>(null);
const size = ref({ w: 800, h: 500 });

const fontSize = computed(() => {
  const s = Math.min(size.value.w, size.value.h);
  return Math.max(18, Math.min(28, s * 0.032));
});

const graphemes = computed(() => {
  if (!import.meta.client) return [];
  if (!text.value) return [];
  return measureGraphemes(text.value, `${fontSize.value}px ${FONT_FAMILY}`);
});

const positions = computed<Position[]>(() => {
  if (graphemes.value.length === 0) return [];
  const fn = LAYOUTS[current.value];
  return fn(graphemes.value, size.value, {
    fontSize: fontSize.value,
    lineHeight: LINE_HEIGHT,
    fontFamily: FONT_FAMILY,
    seed: seed.value,
  });
});

let renderer: Renderer | null = null;

function buildOpts(): RenderOpts {
  const color = import.meta.client
    ? getComputedStyle(document.documentElement).getPropertyValue("--color-text").trim() || "#1a1614"
    : "#1a1614";
  return {
    fontSize: fontSize.value,
    fontFamily: FONT_FAMILY,
    color,
    transitionMs: TRANSITION_MS,
    staggerMs: STAGGER_MS,
  };
}

function currentPayload(): RenderPayload {
  if (graphemes.value.length === 0) return { kind: "idle" };
  return {
    kind: "positioned",
    graphemes: graphemes.value,
    positions: positions.value,
  };
}

function mountRenderer() {
  if (!rendererRef.value) return;
  renderer?.unmount();
  renderer = rendererKind.value === "canvas" ? new CanvasRenderer() : new DomRenderer();
  renderer.mount(rendererRef.value, buildOpts());
  renderer.render(currentPayload());
}

function pushRender() {
  if (!renderer) return;
  renderer.setOpts(buildOpts());
  renderer.render(currentPayload());
}

watch(rendererKind, () => mountRenderer());
watch([current, graphemes, positions, fontSize], () => pushRender(), { deep: true });

const selectMode = (key: ModeKey) => {
  if (key === "scatter" && current.value === "scatter") {
    seed.value += 1;
    return;
  }
  current.value = key;
};

let ro: ResizeObserver | null = null;

onMounted(() => {
  if (slotHostRef.value) {
    const extracted = extractSlotText(slotHostRef.value);
    if (extracted) {
      slotText.value = extracted;
      text.value = extracted;
    }
  }

  const update = () => {
    if (!stageRef.value) return;
    const r = stageRef.value.getBoundingClientRect();
    size.value = { w: r.width, h: r.height };
    renderer?.resize(r.width, r.height);
    renderer?.render(currentPayload());
  };
  update();
  ro = new ResizeObserver(update);
  if (stageRef.value) ro.observe(stageRef.value);

  mountRenderer();
});

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
  renderer?.unmount();
  renderer = null;
});
</script>

<template>
  <div class="tg-root">
    <div
      ref="slotHostRef"
      class="tg-slot-host"
      aria-hidden="true"
    >
      <slot />
    </div>

    <header
      v-if="editable"
      class="tg-topbar"
    >
      <input
        v-model="text"
        type="text"
        class="tg-input"
        :maxlength="MAX_CHARS"
        placeholder="文字を写す"
        spellcheck="false"
        autocapitalize="off"
        autocorrect="off"
      >
      <button
        v-if="text"
        class="tg-field-clear"
        type="button"
        aria-label="消す"
        @click="text = ''"
      >
        ×
      </button>
    </header>

    <main
      ref="stageRef"
      class="tg-stage-wrap"
    >
      <div
        ref="rendererRef"
        class="tg-renderer-layer"
        aria-hidden="true"
      />
    </main>

    <footer class="tg-bottombar">
      <div
        class="tg-mode-group"
        role="group"
        aria-label="字の配り方"
      >
        <button
          v-for="m in MODES"
          :key="m.key"
          type="button"
          :class="['tg-chip', { 'is-active': current === m.key }]"
          :aria-pressed="current === m.key"
          @click="selectMode(m.key)"
        >
          {{ m.jp }}
        </button>
      </div>
      <div
        class="tg-renderer-group"
        role="group"
        aria-label="描き手"
      >
        <button
          type="button"
          :class="['tg-chip', { 'is-active': rendererKind === 'dom' }]"
          :aria-pressed="rendererKind === 'dom'"
          @click="rendererKind = 'dom'"
        >
          紙
        </button>
        <button
          type="button"
          :class="['tg-chip', { 'is-active': rendererKind === 'canvas' }]"
          :aria-pressed="rendererKind === 'canvas'"
          @click="rendererKind = 'canvas'"
        >
          画布
        </button>
      </div>
    </footer>

    <p
      v-if="text"
      class="tg-sr-only"
    >
      {{ text }}
    </p>
  </div>
</template>

<style scoped>
.tg-root {
  position: relative;
  width: 100%;
  max-width: var(--max-width);
  margin: 2.5rem auto;
  color: var(--color-text);
  display: grid;
  grid-template-rows: 1fr auto;
  font-family: var(--font-sans);
}

.tg-root:has(.tg-topbar) {
  grid-template-rows: auto 1fr auto;
}

.tg-root *,
.tg-root *::before,
.tg-root *::after {
  box-sizing: border-box;
}

.tg-slot-host {
  display: none;
}

.tg-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.tg-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid color-mix(in oklab, var(--color-text) 15%, transparent);
  font-family: inherit;
  font-size: 1rem;
  color: var(--color-text);
  caret-color: var(--color-accent-hover);
  letter-spacing: 0.08em;
  padding: 0.25rem 0;
}

.tg-input::placeholder {
  color: color-mix(in oklab, var(--color-text-secondary) 60%, transparent);
}

.tg-input:focus {
  border-bottom-color: var(--color-accent-hover);
}

.tg-field-clear {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0 4px;
  flex-shrink: 0;
  font-family: inherit;
}

.tg-field-clear:hover {
  color: var(--color-accent-hover);
}

.tg-stage-wrap {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 11;
  min-height: 24rem;
}

.tg-renderer-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tg-bottombar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 0 0;
  color: var(--color-text-secondary);
}

.tg-mode-group,
.tg-renderer-group {
  display: flex;
  gap: 0.25rem;
}

.tg-chip {
  padding: 0.25rem 0.625rem;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  letter-spacing: 0.18em;
  line-height: 1;
  border-bottom: 1px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.tg-chip:hover:not(:disabled) {
  color: var(--color-text);
}

.tg-chip.is-active {
  color: var(--color-text);
  border-bottom-color: var(--color-accent-hover);
}

.tg-chip:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.tg-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (width <= 768px) {
  .tg-root {
    margin: 1.75rem auto;
  }

  .tg-stage-wrap {
    aspect-ratio: 4 / 5;
    min-height: 20rem;
  }

  .tg-bottombar {
    gap: 0.75rem;
  }

  .tg-chip {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    letter-spacing: 0.12em;
  }
}
</style>
