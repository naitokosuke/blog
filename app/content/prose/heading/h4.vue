<script setup lang="ts">
const { id } = defineProps<{ id?: string }>();

defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <ProseHeading is="h4" :id>
    <slot />
  </ProseHeading>
</template>
