<script setup lang="ts">
import { computed } from "vue";

// The five glyphs this site draws, inlined.
//
// @nuxt/icon shipped ~27 KB of @iconify runtime (@iconify/vue, @iconify/utils,
// its own plugin) into the critical bundle just to render a <span> whose
// mask-image holds the artwork, and resolved `ph:link-simple` over the network
// because no @iconify-json/ph is installed. The bodies below are that same
// Iconify source at the same viewBox, so the shapes are unchanged.
const ICONS = {
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
