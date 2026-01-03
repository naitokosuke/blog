<script setup lang="ts">
const { data: posts } = await useAsyncData("home-posts", () =>
  queryCollection("posts")
    .where("path", "LIKE", "/posts/%")
    .order("date", "DESC")
    .limit(5)
    .all(),
);
</script>

<template>
  <div>
    <h1>Blog</h1>
    <p>Welcome to my blog.</p>

    <h2>Recent Posts</h2>
    <ul v-if="posts?.length">
      <li v-for="post in posts" :key="post.path">
        <NuxtLink :to="post.path">
          {{ post.title }}
        </NuxtLink>
        <time v-if="post.date">{{ post.date }}</time>
      </li>
    </ul>
    <p v-else>
      No posts yet.
    </p>

    <NuxtLink to="/blog">
      View all posts
    </NuxtLink>
  </div>
</template>
