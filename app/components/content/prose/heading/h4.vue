<script setup lang="ts">
defineProps<{ id?: string }>();
</script>

<template>
  <ProseHeading
    is="h4"
    :id="id"
  >
    <slot />
  </ProseHeading>
</template>
