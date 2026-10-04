<script setup lang="ts">
import { computed } from "vue";

// The one glyph this site draws, inlined.
//
// @nuxt/icon shipped ~27 KB of @iconify runtime (@iconify/vue, @iconify/utils,
// its own plugin) into the critical bundle just to render a <span> whose
// mask-image holds the artwork, and resolved `ph:link-simple` over the network
// because no @iconify-json/ph is installed. The body below is that same
// Iconify source at the same viewBox, so the shape is unchanged.
const ICONS = {
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
