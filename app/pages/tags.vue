<script setup lang="ts">
const { data: posts } = await useAsyncData("tags-posts", () =>
  queryCollection("posts")
    .where("path", "LIKE", "/posts/%")
    .all(),
);

const tags = computed(() => {
  const tagMap = new Map<string, number>();
  for (const post of posts.value ?? []) {
    for (const tag of post.tags ?? []) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
});
</script>

<template>
  <div>
    <h1>Tags</h1>
    <ul v-if="tags.length">
      <li
        v-for="[tag, count] in tags"
        :key="tag"
      >
        {{ tag }} ({{ count }})
      </li>
    </ul>
    <p v-else>
      No tags yet.
    </p>
  </div>
</template>
