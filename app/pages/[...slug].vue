<script setup lang="ts">
import { computed } from "vue";
import {
  createError,
  defineArticle,
  defineOgImage,
  queryCollection,
  useAsyncData,
  useRoute,
  useSchemaOrg,
  useSeoMeta,
} from "#imports";
import { usePostList } from "~/composables/use-post-list";

const route = useRoute();

const [{ data: page }, { data: posts }] = await Promise.all([
  useAsyncData(route.path, () => queryCollection("content").path(route.path).first()),
  usePostList(),
]);

if (page.value == null) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

// The list is newest first, so the entry before this one is the newer post
const neighbours = computed(() => {
  const list = posts.value ?? [];
  const index = list.findIndex((post) => post.path === route.path);
  if (index === -1) return { newer: undefined, older: undefined };
  return { newer: list[index - 1], older: list[index + 1] };
});

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

defineOgImage("Default", {
  title: page.value.title,
  description: page.value.description,
});
</script>

<template>
  <div>
    <template v-if="page">
      <Hero :title="page.title ?? ''" :date="page.date" />
      <article class="prose">
        <ContentRenderer :value="page" />
      </article>
      <footer class="article-end">
        <ShareButtons :title="page.title ?? ''" />
        <nav v-if="neighbours.newer || neighbours.older" aria-label="前後の記事">
          <NuxtLink v-if="neighbours.newer" :to="neighbours.newer.path" class="newer">
            <span class="meta">新しい記事</span>
            <span class="title">{{ neighbours.newer.title }}</span>
          </NuxtLink>
          <NuxtLink v-if="neighbours.older" :to="neighbours.older.path" class="older">
            <span class="meta">古い記事</span>
            <span class="title">{{ neighbours.older.title }}</span>
          </NuxtLink>
        </nav>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.article-end {
  max-width: var(--content-width);
  margin-inline: auto;
  margin-top: 5rem;

  nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 2.5rem;
    border-block: 1px solid var(--color-rule);
  }

  nav a {
    display: grid;
    gap: 0.25rem;
    align-content: start;
    padding-block: 1.5rem;
    color: var(--color-text);

    .title {
      font-size: 1rem;
      line-height: 1.7;
      transition: color 0.2s;
    }

    &:hover .title {
      color: var(--color-accent-hover);
    }
  }

  .newer {
    padding-right: 1.5rem;
  }

  /* An older post on its own still sits in the right-hand column */
  .older {
    grid-column: 2;
    padding-left: 1.5rem;
    border-left: 1px solid var(--color-rule);
    text-align: right;
  }

  @media (width <= 768px) {
    nav {
      grid-template-columns: 1fr;
    }

    .newer {
      padding-right: 0;
    }

    .older {
      grid-column: 1;
      padding-left: 0;
      border-left: none;
      text-align: left;
    }

    .newer + .older {
      border-top: 1px solid var(--color-rule);
    }
  }
}
</style>
