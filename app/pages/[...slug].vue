<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection("posts").path(route.path).first(),
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
  component: "OgImage/Default",
  props: {
    title: page.value.title,
    description: page.value.description,
  },
});
</script>

<template>
  <article
    v-if="page"
    class="prose"
  >
    <h1>{{ page.title }}</h1>
    <ContentRenderer :value="page" />
  </article>
</template>
