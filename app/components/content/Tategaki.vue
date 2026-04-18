<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { measureGraphemes } from "~/utils/tategaki/metrics";
import { LAYOUTS } from "~/utils/tategaki/layouts";

import type { ModeKey, Position } from "~/utils/tategaki/layouts";

const MODES: readonly { key: ModeKey; jp: string }[] = [
  { key: "vertical", jp: "縦" },
  { key: "horizontal", jp: "横" },
  { key: "spiral", jp: "螺旋" },
  { key: "scatter", jp: "散" },
] as const;

const MAX_CHARS = 2000;
const FONT_FAMILY = "\"Zen Old Mincho\", ui-serif, serif";
const LINE_HEIGHT = 1.9;
const STAGGER_MS = 12;

const {
  text: textProp = "",
  editable = false,
  mode: initialMode = "vertical",
} = defineProps<{
  text?: string;
  editable?: boolean;
  mode?: ModeKey;
}>();

defineSlots<{
  default?: () => unknown;
}>();

const slotHost = useTemplateRef<HTMLDivElement>("slot-host");
const stage = useTemplateRef<HTMLDivElement>("stage");

const slotText = ref("");
const text = ref(textProp);
const current = ref<ModeKey>(initialMode);
const seed = ref(0);
const size = ref({ w: 800, h: 500 });

watch(() => textProp, (v) => {
  if (!slotText.value) text.value = v;
});

function extractSlotText(host: HTMLElement): string {
  if (host.children.length === 0) return host.textContent?.trim() ?? "";
  const parts: string[] = [];
  for (const child of Array.from(host.children)) {
    const t = (child.textContent ?? "").trim();
    if (t) parts.push(t);
  }
  return parts.join("\n");
}

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

function isBreak(ch: string): boolean {
  return ch === "\n" || ch === "\r";
}

function selectMode(key: ModeKey): void {
  if (key === "scatter" && current.value === "scatter") {
    seed.value += 1;
    return;
  }
  current.value = key;
}

function clearText(): void {
  text.value = "";
}

let resize: ResizeObserver | null = null;

onMounted(() => {
  if (slotHost.value) {
    const extracted = extractSlotText(slotHost.value);
    if (extracted) {
      slotText.value = extracted;
      text.value = extracted;
    }
  }

  const update = (): void => {
    if (!stage.value) return;
    const r = stage.value.getBoundingClientRect();
    size.value = { w: r.width, h: r.height };
  };
  update();
  resize = new ResizeObserver(update);
  if (stage.value) resize.observe(stage.value);
});

onBeforeUnmount(() => {
  resize?.disconnect();
  resize = null;
});
</script>

<template>
  <div class="tg-root">
    <div
      ref="slot-host"
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
        class="tg-clear"
        type="button"
        aria-label="消す"
        @click="clearText"
      >
        ×
      </button>
    </header>

    <main
      ref="stage"
      class="tg-stage"
      :style="{ '--tg-font-size': `${fontSize}px` }"
      aria-hidden="true"
    >
      <span
        v-for="(pos, i) in positions"
        :key="i"
        class="tg-char"
        :class="{ 'is-break': isBreak(graphemes[i]?.char ?? '') }"
        :style="{
          transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}rad)`,
          transitionDelay: `${i * STAGGER_MS}ms`,
        }"
      >{{ isBreak(graphemes[i]?.char ?? '') ? '' : graphemes[i]?.char }}</span>
    </main>

    <footer class="tg-bottombar">
      <div
        class="tg-modes"
        role="group"
        aria-label="字の配り方"
      >
        <button
          v-for="m in MODES"
          :key="m.key"
          type="button"
          class="tg-chip"
          :class="{ 'is-active': current === m.key }"
          :aria-pressed="current === m.key"
          @click="selectMode(m.key)"
        >
          {{ m.jp }}
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

  &:has(.tg-topbar) {
    grid-template-rows: auto 1fr auto;
  }

  & *,
  & *::before,
  & *::after {
    box-sizing: border-box;
  }
}

.tg-slot-host {
  display: none;
}

.tg-topbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0;

  & .tg-input {
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

    &::placeholder {
      color: color-mix(in oklab, var(--color-text-secondary) 60%, transparent);
    }

    &:focus {
      border-bottom-color: var(--color-accent-hover);
    }
  }

  & .tg-clear {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 1.125rem;
    line-height: 1;
    padding: 0 0.25rem;
    flex-shrink: 0;
    font-family: inherit;

    &:hover {
      color: var(--color-accent-hover);
    }
  }
}

.tg-stage {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 11;
  min-height: 24rem;
  font-size: var(--tg-font-size);

  @media (width <= 768px) {
    aspect-ratio: 4 / 5;
    min-height: 20rem;
  }
}

.tg-char {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: center;
  transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  user-select: none;
  pointer-events: none;
  line-height: 1;
  font-family: var(--font-sans);
  color: var(--color-text);
  font-size: var(--tg-font-size);

  &.is-break {
    visibility: hidden;
  }
}

.tg-bottombar {
  display: flex;
  align-items: center;
  padding: 1.25rem 0 0;
  color: var(--color-text-secondary);

  & .tg-modes {
    display: flex;
    gap: 0.25rem;
  }
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
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover:not(:disabled) {
    color: var(--color-text);
  }

  &.is-active {
    color: var(--color-text);
    border-bottom-color: var(--color-accent-hover);
  }
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

  .tg-chip {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    letter-spacing: 0.12em;
  }
}
</style>
