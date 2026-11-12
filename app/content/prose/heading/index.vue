<script setup lang="ts">
const { is, id } = defineProps<{
  is: "h1" | "h2" | "h3" | "h4";
  id?: string;
}>();

defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <component :is :id>
    <slot v-if="id === undefined" />
    <a v-else :href="`#${id}`">
      <slot />
      <AppIcon class="heading-anchor-icon" name="link-simple" />
    </a>
  </component>
</template>
