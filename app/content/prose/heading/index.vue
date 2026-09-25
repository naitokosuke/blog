<script setup lang="ts">
defineProps<{
  is: "h1" | "h2" | "h3" | "h4";
  id?: string;
}>();
</script>

<template>
  <component :is="is" :id="id">
    <a v-if="id" :href="`#${id}`">
      <slot />
      <Icon name="ph:link-simple" class="heading-anchor-icon" />
    </a>
    <slot v-else />
  </component>
</template>
