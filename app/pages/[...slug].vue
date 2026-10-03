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
import { formatDate, isoDate } from "~/utils/format-date";
import { recordNumberAt } from "~/utils/record-number";

const route = useRoute();

const [{ data: page }, { data: posts }] = await Promise.all([
  useAsyncData(route.path, () => queryCollection("content").path(route.path).first()),
  usePostList(),
]);

if (page.value == null) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const postIndex = computed(() => (posts.value ?? []).findIndex((post) => post.path === route.path));

const recordNumber = computed(() => recordNumberAt(postIndex.value, posts.value?.length ?? 0));

// The list is newest first, so the entry before this one is the newer post
const neighbours = computed(() => {
  const list = posts.value ?? [];
  const index = postIndex.value;
  if (index === -1) return { newer: undefined, older: undefined };
  return { newer: list[index - 1], older: list[index + 1] };
});

// Only a post long enough to lose your place in gets a contents list
const contents = computed(() => {
  const links = page.value?.body?.toc?.links ?? [];
  return links.length >= 4 ? links : [];
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
      <Hero id="top" :title="page.title ?? ''" :date="page.date" :number="recordNumber" />
      <!-- Closed by default: on a long post it is a map to open, not a wall of
           links standing between the title and the first paragraph -->
      <details v-if="contents.length" class="contents">
        <summary>
          目次<span class="meta">{{ contents.length }} 節</span>
        </summary>
        <ol>
          <li v-for="link in contents" :key="link.id">
            <a :href="`#${link.id}`">{{ link.text }}</a>
          </li>
        </ol>
      </details>
      <article class="prose">
        <ContentRenderer :value="page" />
      </article>
      <footer class="article-end">
        <div class="actions">
          <ShareButtons :title="page.title ?? ''" />
          <a href="#top" class="to-top">先頭へ戻る</a>
        </div>
        <nav v-if="neighbours.newer || neighbours.older" aria-label="前後の記事">
          <NuxtLink v-if="neighbours.newer" :to="neighbours.newer.path" class="newer">
            <span class="meta">
              新しい記事
              <time v-if="neighbours.newer.date" :datetime="isoDate(neighbours.newer.date)">
                {{ formatDate(neighbours.newer.date) }}
              </time>
            </span>
            <span class="title">{{ neighbours.newer.title }}</span>
          </NuxtLink>
          <NuxtLink v-if="neighbours.older" :to="neighbours.older.path" class="older">
            <span class="meta">
              古い記事
              <time v-if="neighbours.older.date" :datetime="isoDate(neighbours.older.date)">
                {{ formatDate(neighbours.older.date) }}
              </time>
            </span>
            <span class="title">{{ neighbours.older.title }}</span>
          </NuxtLink>
        </nav>
      </footer>
    </template>
  </div>
</template>

<style scoped>
#top {
  scroll-margin-top: var(--header-height);
}

.contents {
  max-width: var(--content-width);
  margin: -1.5rem auto 3.5rem;
  border-bottom: 1px solid var(--color-rule);

  summary {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    min-height: 44px;
    padding-block: 0.625rem;
    font-size: 1rem;
    color: var(--color-text-secondary);
    cursor: pointer;
    list-style: none;
    transition: color 0.2s;

    &::-webkit-details-marker {
      display: none;
    }

    /* A hairline chevron that turns down when the list is open */
    &::before {
      content: "";
      align-self: center;
      width: 0.4rem;
      height: 0.4rem;
      margin-inline: 0.15rem 0.1rem;
      border-top: 1px solid currentcolor;
      border-right: 1px solid currentcolor;
      rotate: 45deg;
      transition: rotate 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    &:hover {
      color: var(--color-text);
    }
  }

  &[open] summary::before {
    rotate: 135deg;
  }

  ol {
    padding: 0 0 1.5rem 1.75rem;
    list-style: none;
    counter-reset: section;
  }

  li {
    counter-increment: section;
    display: grid;
    grid-template-columns: 2rem 1fr;
    align-items: baseline;

    /* The section's place in the post, which the reader needs to judge length */
    &::before {
      content: counter(section);
      font-size: 0.8125rem;
      font-variant-numeric: tabular-nums;
      color: var(--color-text-secondary);
    }
  }

  a {
    display: block;
    padding-block: 0.3rem;
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--color-text);

    &:hover {
      color: var(--color-accent-hover);
    }
  }
}

.article-end {
  max-width: var(--content-width);
  margin-inline: auto;
  margin-top: 5rem;

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 0 1.5rem;
  }

  .to-top {
    display: inline-block;
    min-height: 44px;
    padding-block: 0.625rem;
    font-size: 0.9375rem;
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-accent-hover);
    }
  }

  nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 1.5rem;
    border-top: 1px solid var(--color-rule);
  }

  nav a {
    display: grid;
    gap: 0.25rem;
    align-content: start;
    padding-block: 1.5rem;
    color: var(--color-text);

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0 1rem;
    }

    .title {
      font-size: 1.0625rem;
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

    .meta {
      justify-content: end;
    }
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

      .meta {
        justify-content: start;
      }
    }

    .newer + .older {
      border-top: 1px solid var(--color-rule);
    }
  }
}
</style>
