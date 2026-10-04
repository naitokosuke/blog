<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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

const route = useRoute();

const [{ data: page }, { data: posts }] = await Promise.all([
  useAsyncData(route.path, () => queryCollection("content").path(route.path).first()),
  usePostList(),
]);

if (page.value == null) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

// The list is newest first, so the entry before this one is the newer post
const neighbours = computed(() => {
  const list = posts.value ?? [];
  const index = list.findIndex((post) => post.path === route.path);
  if (index === -1) return { newer: undefined, older: undefined };
  return { newer: list[index - 1], older: list[index + 1] };
});

// Only a post long enough to lose your place in gets a contents list
const contents = computed(() => {
  const links = page.value?.body?.toc?.links ?? [];
  return links.length >= 4 ? links : [];
});

// On a wide screen the contents stand open in the right margin and follow the
// reader down the page, marking the section being read. On a narrow one they
// stay a closed list under the title.
const WIDE = "(width >= 1280px)";
const contentsOpen = ref(false);
const activeId = ref<string>();

let wide: MediaQueryList | undefined;
let observer: IntersectionObserver | undefined;

function syncOpen(): void {
  contentsOpen.value = wide?.matches ?? false;
}

onMounted(() => {
  if (!contents.value.length) return;
  wide = window.matchMedia(WIDE);
  syncOpen();
  wide.addEventListener("change", syncOpen);

  // A section counts as being read once its heading has passed the upper
  // third of the viewport
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = entry.target.id;
      }
    },
    { rootMargin: "0px 0px -66% 0px" },
  );
  for (const link of contents.value) {
    const heading = document.getElementById(link.id);
    if (heading) observer.observe(heading);
  }
});

onBeforeUnmount(() => {
  wide?.removeEventListener("change", syncOpen);
  observer?.disconnect();
});

function onToggle(event: Event): void {
  contentsOpen.value = (event.target as HTMLDetailsElement).open;
}

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
      <Hero id="top" :title="page.title ?? ''" :date="page.date" />
      <details v-if="contents.length" class="contents" :open="contentsOpen" @toggle="onToggle">
        <summary>目次</summary>
        <ol>
          <li v-for="link in contents" :key="link.id">
            <a :href="`#${link.id}`" :aria-current="activeId === link.id ? 'location' : undefined">
              {{ link.text }}
            </a>
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
        <!-- The way on is set like the index: the next title, large -->
        <nav v-if="neighbours.newer || neighbours.older" aria-label="前後の記事">
          <NuxtLink v-if="neighbours.newer" :to="neighbours.newer.path">
            <span class="meta">
              新しい記事
              <time v-if="neighbours.newer.date" :datetime="isoDate(neighbours.newer.date)">
                {{ formatDate(neighbours.newer.date) }}
              </time>
            </span>
            <span class="title">{{ neighbours.newer.title }}</span>
          </NuxtLink>
          <NuxtLink v-if="neighbours.older" :to="neighbours.older.path">
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
  margin: calc(clamp(3rem, 7vw, 5rem) * -0.5) auto clamp(3rem, 7vw, 4.5rem);

  summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 44px;
    font-size: var(--text-small);
    letter-spacing: 0.12em;
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
    padding: 0.25rem 0 0 1.5rem;
    list-style: none;
  }

  a {
    display: block;
    padding-block: 0.5rem;
    font-size: var(--text-small);
    line-height: 1.6;
    color: var(--color-text);

    &:hover {
      color: var(--color-accent-hover);
    }
  }
}

/* Wide: the contents leave the column and stand in the right margin, level
   with the start of the text, and stay there as the reader scrolls */
@media (width >= 1280px) {
  .contents {
    position: fixed;
    top: calc(var(--header-height) + 3rem);
    left: calc(50% + var(--content-width) / 2 + 3.5rem);
    width: min(15rem, calc(50% - var(--content-width) / 2 - 5rem));
    max-height: calc(100dvh - var(--header-height) - 6rem);
    margin: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    /* Out here the wall is at full strength, so each line carries a little of
       the page's darkness (or paper) around it to stay legible */
    text-shadow:
      0 0 0.35em var(--color-bg),
      0 0 0.8em var(--color-bg);

    /* Always open here, so the toggle has nothing to do */
    summary {
      pointer-events: none;
      min-height: 0;
      margin-bottom: 0.5rem;

      &::before {
        display: none;
      }
    }

    ol {
      padding: 0;
    }

    a {
      padding-block: 0.3rem;
      font-size: var(--text-meta);
      line-height: 1.6;
      color: var(--color-text-secondary);

      /* The section being read */
      &[aria-current] {
        color: var(--color-text);
      }
    }
  }
}

.article-end {
  max-width: var(--content-width);
  margin-inline: auto;
  margin-top: 6rem;

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
    font-size: var(--text-small);
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-accent-hover);
    }
  }

  nav {
    display: grid;
    gap: 2.5rem;
    margin-top: 4rem;
  }

  nav a {
    display: grid;
    gap: 0.375rem;
    color: var(--color-text);

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0 1rem;
    }

    .title {
      font-size: var(--text-h2);
      line-height: 1.35;
      letter-spacing: 0.03em;
      font-feature-settings: "palt";
      text-wrap: balance;
      transition: color 0.25s;
    }

    &:hover .title {
      color: var(--color-accent-hover);
    }
  }

  @media (width <= 768px) {
    nav a .title {
      font-size: 1.4375rem;
    }
  }
}
</style>
