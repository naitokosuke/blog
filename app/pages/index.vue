<script setup lang="ts">
import { computed } from "vue";
import { defineOgImage, defineWebPage, defineWebSite, useSchemaOrg, useSeoMeta } from "#imports";
import { usePostList } from "~/composables/use-post-list";
import { formatDate, isoDate } from "~/utils/format-date";

const { data: posts } = await usePostList();

// One group per year, newest first
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

<!-- The titles are the page. They are set large and told apart by the space
     between them, with no rules; the date hangs in the margin beside each
     one so the left edge of the column is all titles. -->
<template>
  <div class="index">
    <h1>ナイトウコウスケのブログ</h1>

    <template v-if="years.length">
      <section v-for="group in years" :key="group.year" :aria-labelledby="`year-${group.year}`">
        <h2 :id="`year-${group.year}`" class="year">{{ group.year }}</h2>
        <ol>
          <li v-for="post in group.posts" :key="post.path">
            <NuxtLink :to="post.path">
              <!-- Every entry is the same height: one line of title, one line
                   of description, kept even when the post has none -->
              <span class="title">{{ post.title }}</span>
              <span class="description">
                {{ post.description && post.description !== post.title ? post.description : "" }}
              </span>
            </NuxtLink>
            <time v-if="post.date" class="meta" :datetime="isoDate(post.date)">
              {{ formatDate(post.date).slice(5) }}
            </time>
          </li>
        </ol>
      </section>
    </template>
    <p v-else class="empty">まだ記事はありません。</p>
  </div>
</template>

<style scoped>
.index {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-block: clamp(3rem, 8vw, 5.5rem) 4rem;
}

h1 {
  font-size: var(--text-small);
  letter-spacing: 0.12em;
  color: var(--color-text-secondary);
}

section {
  margin-top: clamp(2.5rem, 6vw, 4rem);
}

/* Where the year turns, a hairline across the column (and, on a wide screen,
   across the margin the dates hang in) marks the break */
section + section {
  padding-top: clamp(2.5rem, 6vw, 4rem);
  border-top: 1px solid var(--color-rule);
}

.year {
  font-size: var(--text-meta);
  letter-spacing: 0.2em;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
}

ol {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
  list-style: none;
  padding: 0;
}

li {
  display: grid;
  /* Date above the title by default; hung in the margin when there is room */
  grid-template-areas:
    "date"
    "entry";
}

a {
  grid-area: entry;
  display: grid;
  gap: 0.375rem;
  color: var(--color-text);

  &:hover .title {
    color: var(--color-accent-hover);
  }
}

time {
  grid-area: date;
  margin-bottom: 0.25rem;
}

/* Title and description are each held to exactly one line, cut with an
   ellipsis, so every entry in the list has the same height */
.title,
.description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title {
  font-size: var(--text-entry);
  line-height: 1.35;
  letter-spacing: 0.03em;
  font-feature-settings: "palt";
  transition: color 0.25s;
}

.description {
  max-width: 38em;
  /* An empty line still takes its height */
  min-height: 1lh;
  font-size: var(--text-small);
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.empty {
  color: var(--color-text-secondary);
}

/* Room on both sides of the column: the date and the year move out into the
   left margin and sit on the first line of the title */
@media (width >= 1040px) {
  .year,
  li,
  section + section {
    margin-left: calc(var(--hang) * -1);
  }

  /* The section itself now starts in the margin, so its children are already
     out there */
  section + section :is(.year, li) {
    margin-left: 0;
  }

  .year {
    width: var(--hang);
  }

  li {
    grid-template-columns: var(--hang) 1fr;
    grid-template-areas: "date entry";
    align-items: baseline;
  }

  /* Baseline alignment puts the date on the title's first line */
  time {
    margin-bottom: 0;
  }
}

@media (width <= 768px) {
  .title {
    font-size: 1.4375rem;
  }
}
</style>
