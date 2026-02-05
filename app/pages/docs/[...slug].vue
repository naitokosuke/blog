<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection("docs").path(route.path).first(),
);

if (page.value == null) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const title = computed(() => page.value?.title || extractTitleFromPath(route.path));

function extractTitleFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last?.replace(/-/g, " ") || "Documentation";
}

useSeoMeta({
  title: title.value,
  description: page.value?.description,
  ogTitle: title.value,
  ogDescription: page.value?.description,
});
</script>

<template>
  <div v-if="page">
    <Hero :title="title" />
    <article class="prose">
      <ContentRenderer :value="page" />
    </article>
  </div>
</template>
