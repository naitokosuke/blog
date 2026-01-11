<script setup lang="ts">
const { data: posts } = await useAsyncData("posts", () =>
  queryCollection("posts")
    .where("path", "NOT LIKE", "/")
    .order("date", "DESC")
    .all(),
);

useSeoMeta({
  title: "blog.naito.dev",
  description: "ナイトウコウスケのブログ",
  ogTitle: "blog.naito.dev",
  ogDescription: "ナイトウコウスケのブログ",
  ogType: "website",
  twitterCard: "summary_large_image",
});

useSchemaOrg([
  defineWebSite({
    name: "blog.naito.dev",
  }),
  defineWebPage(),
]);

defineOgImage({
  component: "OgImage",
  props: {
    title: "blog.naito.dev",
    description: "ナイトウコウスケのブログ",
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
        <NuxtLink :to="post.path">
          <time v-if="post.date">{{ post.date }}</time>
          <span class="title">{{ post.title }}</span>
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
    margin-bottom: 1.5rem;
  }

  a {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: var(--color-text);

    &:hover {
      color: var(--color-accent-hover);
    }
  }

  time {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .title {
    font-size: 1rem;
  }
}
</style>
