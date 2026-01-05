<script setup lang="ts">
defineProps<{ id?: string }>();
</script>

<template>
  <ProseHeading
    is="h2"
    :id="id"
  >
    <slot />
  </ProseHeading>
</template>
