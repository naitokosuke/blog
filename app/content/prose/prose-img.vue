<script setup lang="ts">
import { safeUrl } from "~/utils/safe-url";

const { src, alt, width, height } = defineProps<{
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}>();
</script>

<!-- Lazy: an article's images would otherwise all be fetched at page start
     and share the bandwidth with the render-blocking CSS -->
<template>
  <img :src="safeUrl(src)" :alt :width :height decoding="async" loading="lazy" />
</template>
