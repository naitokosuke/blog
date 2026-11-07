<script setup lang="ts">
import { safeUrl } from "~/utils/safe-url";

const { src, alt, width, height } = defineProps<{
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}>();
</script>

<template>
  <img :src="safeUrl(src)" :alt :width :height />
</template>
