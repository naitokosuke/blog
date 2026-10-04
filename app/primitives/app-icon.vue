<script setup lang="ts">
import { computed } from "vue";

// The seven glyphs this site draws, inlined.
//
// @nuxt/icon shipped ~27 KB of @iconify runtime (@iconify/vue, @iconify/utils,
// its own plugin) into the critical bundle just to render a <span> whose
// mask-image holds the artwork, and resolved `ph:link-simple` over the network
// because no @iconify-json/ph is installed. The bodies below are that same
// Iconify source at the same viewBox, so the shapes are unchanged.
const ICONS = {
  rss: {
    box: "0 0 24 24",
    body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></g>`,
  },
  wind: {
    box: "0 0 24 24",
    body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.8 19.6A2 2 0 1 0 14 16H2m15.5-8a2.5 2.5 0 1 1 2 4H2m7.8-7.6A2 2 0 1 1 11 8H2"/>`,
  },
  "cloud-fog": {
    box: "0 0 24 24",
    body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M16 17H7m10 4H9"/>`,
  },
  eye: {
    box: "0 0 24 24",
    body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></g>`,
  },
  "eye-off": {
    box: "0 0 24 24",
    body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575a1 1 0 0 1 0 .696a10.8 10.8 0 0 1-1.444 2.49m-6.41-.679a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 4.446-5.143M2 2l20 20"/></g>`,
  },
  github: {
    box: "0 0 24 24",
    body: `<path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>`,
  },
  "link-simple": {
    box: "0 0 256 256",
    body: `<path fill="currentColor" d="M165.66 90.34a8 8 0 0 1 0 11.32l-64 64a8 8 0 0 1-11.32-11.32l64-64a8 8 0 0 1 11.32 0M215.6 40.4a56 56 0 0 0-79.2 0l-30.06 30.05a8 8 0 0 0 11.32 11.32l30.06-30a40 40 0 0 1 56.57 56.56l-30.07 30.06a8 8 0 0 0 11.31 11.32l30.07-30.11a56 56 0 0 0 0-79.2m-77.26 133.82l-30.06 30.06a40 40 0 1 1-56.56-56.57l30.05-30.05a8 8 0 0 0-11.32-11.32L40.4 136.4a56 56 0 0 0 79.2 79.2l30.06-30.07a8 8 0 0 0-11.32-11.31"/>`,
  },
} as const;

// The module sized icons as a 1em box scaled by font-size; keeping that default
// means CSS that already sizes an icon (the heading anchor's 0.7em) still does
const { name, size = "1em" } = defineProps<{
  name: keyof typeof ICONS;
  size?: string | number;
}>();

const icon = computed(() => ICONS[name]);
const length = computed(() => (typeof size === "number" ? `${size}px` : size));
</script>

<template>
  <svg
    :viewBox="icon.box"
    :width="length"
    :height="length"
    aria-hidden="true"
    focusable="false"
    v-html="icon.body"
  />
</template>

<style scoped>
/* @nuxt/icon rendered an inline-block span; match it so nothing shifts */
svg {
  display: inline-block;
}
</style>
