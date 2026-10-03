<script setup lang="ts">
import { computed } from "vue";
import { defineOgImage, defineWebPage, defineWebSite, useSchemaOrg, useSeoMeta } from "#imports";
import { usePostList } from "~/composables/use-post-list";
import { formatDate, isoDate } from "~/utils/format-date";
import { formatRecordNumber } from "~/utils/record-number";

const { data: posts } = await usePostList();

type Post = NonNullable<typeof posts.value>[number];

// The index reads as a ledger: one ruled section per year, newest first, each
// entry carrying the number it was filed under (counted from the oldest)
const years = computed(() => {
  const list = posts.value ?? [];
  const groups: { year: string; posts: (Post & { number: number })[] }[] = [];
  list.forEach((post, index) => {
    const entry = { ...post, number: list.length - index };
    const year = post.date?.slice(0, 4) ?? "";
    const last = groups.at(-1);
    if (last?.year === year) last.posts.push(entry);
    else groups.push({ year, posts: [entry] });
  });
  return groups;
});

// The span the archive covers, oldest year first: "2025 – 2026"
const span = computed(() => {
  const first = years.value.at(-1)?.year;
  const last = years.value.at(0)?.year;
  return first === last ? first : `${first} – ${last}`;
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
    <!-- The header already names the domain; the masthead names whose
         records these are and how many there are -->
    <header class="masthead bleed">
      <h1>ナイトウコウスケのブログ</h1>
      <p v-if="posts?.length" class="meta">
        <span>{{ posts.length }} 件の記録</span>
        <span>{{ span }}</span>
      </p>
    </header>

    <template v-if="years.length">
      <section v-for="group in years" :key="group.year" :aria-labelledby="`year-${group.year}`">
        <h2 :id="`year-${group.year}`" class="year">{{ group.year }}</h2>
        <ol>
          <li v-for="post in group.posts" :key="post.path">
            <NuxtLink :to="post.path">
              <time v-if="post.date" class="meta date" :datetime="isoDate(post.date)">
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
              <span class="meta number">{{ formatRecordNumber(post.number) }}</span>
            </NuxtLink>
          </li>
        </ol>
      </section>
    </template>
    <p v-else class="empty">まだ記録はありません。</p>
  </div>
</template>

<style scoped>
.index {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-bottom: 4rem;
}

.masthead {
  padding-block: clamp(3.5rem, 10vw, 7rem) 1.75rem;
  margin-bottom: clamp(3rem, 7vw, 4.5rem);
  border-bottom: 1px solid var(--color-rule);

  h1 {
    font-size: clamp(2rem, 1.2rem + 3.4vw, 3.5rem);
    line-height: 1.35;
    letter-spacing: 0.06em;
    font-feature-settings: "palt";
    text-wrap: balance;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 1.5rem;
    margin-top: 1.25rem;
  }
}

section + section {
  margin-top: 3.5rem;
}

/* The year is a plain ruled heading; the bleed is kept for the masthead and
   the openers, so it stays a mark rather than a pattern */
.year {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-text-secondary);
  font-size: 0.9375rem;
  letter-spacing: 0.24em;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

ol {
  list-style: none;
  padding: 0;
}

li {
  position: relative;
  border-bottom: 1px solid var(--color-rule);

  /* On hover the bleed soaks along the row's own rule */
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: calc((var(--bleed-height) - 1px) / -2 - 1px);
    width: var(--bleed-length);
    height: var(--bleed-height);
    background-image: var(--bleed-paint);
    mask-image: var(--bleed-fibre);
    mask-size: 320px 100%;
    clip-path: inset(0 100% 0 0);
    transition: clip-path 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  &:has(a:hover, a:focus-visible)::after {
    clip-path: inset(0);
  }
}

a {
  display: grid;
  grid-template-columns: 4.5rem 1fr auto;
  gap: 1.5rem;
  align-items: baseline;
  padding-block: 1.25rem;
  color: var(--color-text);

  &:hover .title {
    color: var(--color-accent-hover);
  }
}

.number {
  white-space: nowrap;
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

/* Two lines before it gives up, so a description is read, not guessed at */
.description {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty {
  color: var(--color-text-secondary);
}

@media (width <= 768px) {
  a {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "date number"
      "body body";
    gap: 0.25rem 1rem;
  }

  .date {
    grid-area: date;
  }

  .number {
    grid-area: number;
  }

  .body {
    grid-area: body;
  }

  .title {
    font-size: 1.0625rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  li::after {
    transition: none;
  }
}
</style>
