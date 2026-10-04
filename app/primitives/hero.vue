<script setup lang="ts">
import { formatDate, isoDate } from "~/utils/format-date";

defineProps<{
  title: string;
  date?: string;
}>();
</script>

<template>
  <!-- The page's title block: the title at the largest size on the site and
       the date hung in the margin beside it, as on the index. No rule closes
       it; the space before the first paragraph does. -->
  <header class="hero">
    <p v-if="date" class="meta">
      <time :datetime="isoDate(date)">{{ formatDate(date) }}</time>
    </p>
    <h1>{{ title }}</h1>
  </header>
</template>

<style scoped>
.hero {
  display: grid;
  max-width: var(--content-width);
  margin-inline: auto;
  padding-block: clamp(3rem, 8vw, 6rem) 0;
  margin-bottom: clamp(3rem, 7vw, 5rem);

  .meta {
    margin-bottom: 1rem;
  }

  h1 {
    font-size: var(--text-title);
    line-height: 1.3;
    letter-spacing: 0.03em;
    font-feature-settings: "palt";
    text-wrap: balance;
  }
}

@media (width >= 1040px) {
  .hero {
    grid-template-columns: var(--hang) 1fr;
    align-items: baseline;
    max-width: calc(var(--content-width) + var(--hang));
    margin-left: calc(var(--hang) * -1);

    .meta {
      margin-bottom: 0;
    }
  }
}
</style>
