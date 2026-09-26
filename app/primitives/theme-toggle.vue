<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === "dark");

function toggleTheme(): void {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    >
      {{ isDark ? "表" : "裏" }}
    </button>
    <template #fallback>
      <button type="button" aria-label="Toggle theme">暗</button>
    </template>
  </ClientOnly>
</template>

<style scoped>
/* This button is the only Noto Serif JP on the site, and it renders exactly
 * three glyphs. Declaring the faces here keeps @nuxt/fonts from resolving the
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

@font-face {
  font-family: "Noto Serif JP";
  src:
    local("Noto Serif JP Regular"),
    local("Noto Serif JP"),
    url("/fonts/noto-serif-jp-an.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+6697; /* 暗 */
}

button {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
  font-family: "Noto Serif JP", serif;
  font-size: 18px;
  font-weight: 500;

  &:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
  }
}
</style>
