<script setup lang="ts">
import { computed } from "vue";
import { defineOgImage, defineWebPage, defineWebSite, useSchemaOrg, useSeoMeta } from "#imports";
import { usePostList } from "~/composables/use-post-list";
import { formatDate, isoDate } from "~/utils/format-date";

const { data: posts } = await usePostList();

// The index reads as a ledger: one ruled section per year, newest first
const years = computed(() => {
  const groups: { year: string; posts: NonNullable<typeof posts.value> }[] = [];
  for (const post of posts.value ?? []) {
    const year = post.date?.slice(0, 4) ?? "";
    const last = groups.at(-1);
    if (last?.year === year) last.posts.push(post);
    else groups.push({ year, posts: [post] });
  }
  return groups;
});

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

defineOgImage("Default", {
  title: "blog.naito.dev",
  description: "ナイトウコウスケのブログ",
});
</script>

<template>
  <div class="index">
    <header class="masthead">
      <h1>blog.naito.dev</h1>
      <p>ナイトウコウスケのブログ</p>
    </header>

    <template v-if="years.length">
      <section v-for="group in years" :key="group.year" :aria-labelledby="`year-${group.year}`">
        <h2 :id="`year-${group.year}`" class="year">{{ group.year }}</h2>
        <ol>
          <li v-for="post in group.posts" :key="post.path">
            <NuxtLink :to="post.path">
              <time v-if="post.date" class="meta" :datetime="isoDate(post.date)">
                {{ formatDate(post.date).slice(5) }}
              </time>
              <span class="body">
                <span class="title">{{ post.title }}</span>
                <span
                  v-if="post.description && post.description !== post.title"
                  class="description"
                >
                  {{ post.description }}
                </span>
              </span>
            </NuxtLink>
          </li>
        </ol>
      </section>
    </template>
    <p v-else class="empty">No posts yet.</p>
  </div>
</template>

<style scoped>
.index {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-bottom: 4rem;
}

.masthead {
  padding-block: clamp(3.5rem, 10vw, 7rem) clamp(2.5rem, 6vw, 4rem);

  h1 {
    font-size: clamp(2rem, 1.3rem + 3vw, 3.25rem);
    line-height: 1.3;
    letter-spacing: 0.04em;
  }

  p {
    margin-top: 0.75rem;
    font-size: 0.9375rem;
    letter-spacing: 0.16em;
    color: var(--color-text-secondary);
  }
}

section + section {
  margin-top: 3.5rem;
}

/* The year sits on a hairline with a short stroke of blood, the same mark
   that opens an article's sections. */
.year {
  position: relative;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-rule);
  font-size: 0.875rem;
  letter-spacing: 0.24em;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 2.5rem;
    height: 1px;
    background-color: var(--color-blood);
  }
}

ol {
  list-style: none;
  padding: 0;
}

li {
  border-bottom: 1px solid var(--color-rule);
}

a {
  position: relative;
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: 1.5rem;
  align-items: baseline;
  padding-block: 1.25rem;
  color: var(--color-text);

  /* On hover a thin line of blood seeps along the row's left edge */
  &::before {
    content: "";
    position: absolute;
    inset-block: 1.25rem;
    left: -1rem;
    width: 1px;
    background-color: var(--color-blood);
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  &:hover::before,
  &:focus-visible::before {
    transform: scaleY(1);
  }

  &:hover .title {
    color: var(--color-accent-hover);
  }
}

.body {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.title {
  font-size: 1.1875rem;
  line-height: 1.6;
  letter-spacing: 0.05em;
  font-feature-settings: "palt";
  transition: color 0.2s;
}

.description {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  color: var(--color-text-secondary);
}

@media (width <= 768px) {
  a {
    grid-template-columns: 1fr;
    gap: 0.25rem;

    &::before {
      left: calc(var(--gutter) / -2);
    }
  }

  .title {
    font-size: 1.0625rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  a::before {
    transition: none;
  }
}
</style>
