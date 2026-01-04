<script setup lang="ts">
const { data: posts } = await useAsyncData("posts", () =>
  queryCollection("posts")
    .where("path", "NOT LIKE", "/")
    .order("date", "DESC")
    .all(),
);

useSeoMeta({
  title: "naitokosuke blog",
  description: "naitokosuke のログ",
  ogTitle: "naitokosuke blog",
  ogDescription: "naitokosuke のブログ",
  ogType: "website",
  twitterCard: "summary_large_image",
});

useSchemaOrg([
  defineWebSite({
    name: "naitokosuke blog",
  }),
  defineWebPage(),
]);

defineOgImage({
  component: "OgImageDefault",
  props: {
    title: "naitokosuke blog",
    description: "naitokosuke のブログ",
  },
});
</script>

<template>
  <div class="posts">
    <h1>Posts</h1>
    <ul v-if="posts?.length">
      <li
        v-for="post in posts"
        :key="post.path"
      >
        <time v-if="post.date">[{{ post.date }}]</time>
        <NuxtLink :to="post.path">
          {{ post.title }}
        </NuxtLink>
      </li>
    </ul>
    <p v-else>
      No posts yet.
    </p>
  </div>
</template>

<style scoped>
.posts {
  h1 {
    font-size: 1rem;
    font-weight: 400;
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  time {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  a {
    color: var(--color-text);

    &:hover {
      color: var(--color-accent-hover);
    }
  }
}
</style>
