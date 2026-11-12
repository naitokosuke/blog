<script setup lang="ts">
const { id } = defineProps<{ id?: string }>();

defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <ProseHeading is="h3" :id>
    <slot />
  </ProseHeading>
</template>
