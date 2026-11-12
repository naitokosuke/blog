<script setup lang="ts">
import { computed } from "vue";
import { defineOgImage, defineWebPage, defineWebSite, useSchemaOrg, useSeoMeta } from "#imports";
import { usePostList } from "~/composables/use-post-list";
import { formatDate, isoDate } from "~/utils/format-date";

const { data: posts } = await usePostList();

// One group per year, newest first
const years = computed(() => {
  const groups: { id: string; year: string; posts: NonNullable<typeof posts.value> }[] = [];
  for (const post of posts.value ?? []) {
    const year = post.date?.slice(0, 4) ?? "";
    const last = groups.at(-1);
    if (last?.year === year) last.posts.push(post);
    else groups.push({ id: `year-${year}`, year, posts: [post] });
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

// The full registered name keeps the template hash in the URL; see [...slug].vue.
defineOgImage("DefaultTakumi", {
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
      <section v-for="group in years" :key="group.year" :aria-labelledby="group.id">
        <h2 :id="group.id" class="year">{{ group.year }}</h2>
        <ol>
          <li v-for="post in group.posts" :key="post.path">
            <NuxtLink :to="post.path">
              <span class="title">{{ post.title }}</span>
              <span
                v-if="(post.description ?? '') !== '' && post.description !== post.title"
                class="description"
              >
                {{ post.description }}
              </span>
            </NuxtLink>
            <time v-if="post.date != null" class="meta" :datetime="isoDate(post.date)">
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
  font-family: var(--font-ui);
  font-size: var(--text-small);
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}

section {
  margin-block-start: clamp(2.5rem, 6vw, 4rem);

  /* Where the year turns, a hairline across the column (and, on a wide screen,
     across the margin the dates hang in) marks the break */
  & + section {
    padding-block-start: clamp(2.5rem, 6vw, 4rem);
    border-block-start: 1px solid var(--color-rule);

    /* Room on both sides: the section itself starts in the margin, so its
       children are already out there */
    @media (width >= 1040px) {
      margin-inline-start: calc(var(--hang) * -1);

      :is(.year, li) {
        margin-inline-start: 0;
      }
    }
  }
}

.year {
  font-family: var(--font-ui);
  font-size: var(--text-meta);
  letter-spacing: 0.1em;
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

  /* Reached for, the entry comes up out of the dark with a soft bloom */
  &:is(:hover, :focus-visible) {
    color: var(--color-text);
    outline: none;

    .title {
      text-shadow:
        var(--drop),
        0 0 0.6em var(--glow);
    }

    .description {
      color: var(--color-text);
    }
  }
}

/* Light on one entry, and the rest fall back into the fog or the dark:
   a flashlight shows you one thing at a time. Set on the children, since
   the li's own opacity belongs to the reach-of-sight animation. */
li > * {
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

ol:has(a:is(:hover, :focus-visible)) li:not(:has(a:is(:hover, :focus-visible))) > * {
  opacity: 0.3;
}

time {
  grid-area: date;
  margin-bottom: 0.25rem;
}

/* Title and description are each held to one line, cut with an ellipsis.
   A post without a description is one line shorter: a blank line held open
   for it read as a hole in the list. */
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
  /* Room inside the clipped box for the bloom to spread */
  padding-block: 0.1em;
  transition: text-shadow 0.8s;
}

.description {
  max-width: 38em;
  font-size: var(--text-small);
  line-height: 1.7;
  color: var(--color-text-secondary);
  transition: color 0.8s;
}

.empty {
  color: var(--color-text-secondary);
}

/* Room on both sides of the column: the date and the year move out into the
   left margin and sit on the first line of the title */
@media (width >= 1040px) {
  .year,
  li {
    margin-inline-start: calc(var(--hang) * -1);
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
