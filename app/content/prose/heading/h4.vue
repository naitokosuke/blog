<script setup lang="ts">
defineProps<{ id?: string }>();
</script>

<template>
  <ProseHeading is="h4" :id>
    <slot />
  </ProseHeading>
</template>
