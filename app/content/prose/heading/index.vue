<script setup lang="ts">
const { is, id } = defineProps<{
  is: "h1" | "h2" | "h3" | "h4";
  id?: string;
}>();
</script>

<template>
  <component :is :id>
    <a v-if="id !== undefined" :href="`#${id}`">
      <slot />
      <AppIcon class="heading-anchor-icon" name="link-simple" />
    </a>
    <slot v-else />
  </component>
</template>
