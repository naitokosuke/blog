<script setup lang="ts">
defineProps<{ id?: string }>();
</script>

<template>
  <ProseHeading
    is="h3"
    :id="id"
  >
    <slot />
  </ProseHeading>
</template>
