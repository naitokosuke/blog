<script setup lang="ts">
import { computed } from "vue";
import { useColorMode } from "#imports";

const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === "dark");

function toggleTheme(): void {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>

<!-- Both worlds are always on the button and the one you are in is lit, so the
     glyphs show where you are rather than where a press would take you. The
     server cannot know the stored preference, so it renders both unlit and
     hydration only lights one; nothing swaps. -->
<template>
  <button
    type="button"
    :aria-pressed="isDark"
    :title="isDark ? '表の世界へ戻る' : '裏の世界へ行く'"
    @click="toggleTheme"
  >
    <span class="visually-hidden">裏の世界（ダークモード）</span>
    <ClientOnly>
      <span aria-hidden="true" class="world" :class="{ current: !isDark }">表</span>
      <span aria-hidden="true" class="world" :class="{ current: isDark }">裏</span>
      <template #fallback>
        <span aria-hidden="true" class="world">表</span>
        <span aria-hidden="true" class="world">裏</span>
      </template>
    </ClientOnly>
  </button>
</template>

<style scoped>
/* This button is the only Noto Serif JP on the site, and it renders exactly
 * two glyphs. Declaring the faces here keeps @nuxt/fonts from resolving the
 * family itself, which would inline all ~124 Google subsets (112 KB of CSS)
 * into the head of every page. The woff2 files are the same Google subsets
 * the module downloaded, self-hosted and pinned to one codepoint each so the
 * browser fetches only the glyph it is about to draw. */
@font-face {
  font-family: "Noto Serif JP";
  src:
    local("Noto Serif JP Regular"),
    local("Noto Serif JP"),
    url("/fonts/noto-serif-jp-omote.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+8868; /* 表 */
}

@font-face {
  font-family: "Noto Serif JP";
  src:
    local("Noto Serif JP Regular"),
    local("Noto Serif JP"),
    url("/fonts/noto-serif-jp-ura.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+88CF; /* 裏 */
}

button {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 0.375rem;
  height: 44px;
  padding-inline: 0.5rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: "Noto Serif JP", serif;
  font-size: 1.0625rem;
  font-weight: 400;
  line-height: 1;
}

/* Both glyphs stay readable; the current world is in full ink */
.world {
  transition: color 0.3s;

  &.current {
    color: var(--color-text);
  }
}

/* The glyph you would cross to is the one that answers the pointer */
button:hover .world:not(.current) {
  color: var(--color-accent-hover);
}
</style>
