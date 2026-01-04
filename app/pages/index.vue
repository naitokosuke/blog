<script setup lang="ts">
const { data: posts } = await useAsyncData("posts", () =>
  queryCollection("posts")
    .where("path", "NOT LIKE", "/")
    .order("date", "DESC")
    .all(),
);

useSeoMeta({
  title: "naitokosuke blog",
  description: "naitokosuke の技術ブログ",
  ogTitle: "naitokosuke blog",
  ogDescription: "naitokosuke の技術ブログ",
  ogType: "website",
  twitterCard: "summary_large_image",
});

useSchemaOrg([
  defineWebSite({
    name: "naitokosuke blog",
  }),
  defineWebPage(),
]);
</script>

<template>
  <div>
    <h1>Posts</h1>
    <ul v-if="posts?.length">
      <li
        v-for="post in posts"
        :key="post.path"
      >
        <NuxtLink :to="post.path">
          {{ post.title }}
        </NuxtLink>
        <time v-if="post.date">{{ post.date }}</time>
      </li>
    </ul>
    <p v-else>
      No posts yet.
    </p>
  </div>
</template>
