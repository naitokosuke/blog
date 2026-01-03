<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData(route.path, async () => {
  // Try posts collection first
  const post = await queryCollection("posts").path(route.path).first();
  if (post) return post;

  // Then try pages collection
  return queryCollection("pages").path(route.path).first();
});

if (page.value == null) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
</template>
