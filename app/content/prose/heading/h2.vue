<script setup lang="ts">
const { id } = defineProps<{ id?: string }>();
</script>

<template>
  <ProseHeading is="h2" :id>
    <slot />
  </ProseHeading>
</template>
