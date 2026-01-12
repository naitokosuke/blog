<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection("content").path(route.path).first(),
);

if (page.value == null) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
  ogType: "article",
  twitterCard: "summary_large_image",
});

useSchemaOrg([
  defineArticle({
    headline: page.value.title,
    description: page.value.description,
    datePublished: page.value.date,
    author: {
      name: "naitokosuke",
      url: "https://x.com/naitokosuke",
    },
  }),
]);

defineOgImage({
  component: "OgImage",
  props: {
    title: page.value.title,
    description: page.value.description,
  },
});
</script>

<template>
  <div v-if="page">
    <Hero
      :title="page.title"
      show-share
    />
    <article class="prose">
      <ContentRenderer :value="page" />
    </article>
    <div class="share-section">
      <ShareButtons :title="page.title" />
    </div>
  </div>
</template>

<style scoped>
.share-section {
  display: flex;
  justify-content: center;
  max-width: var(--max-width);
  margin-inline: auto;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}
</style>
