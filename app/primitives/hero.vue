<script setup lang="ts">
import { formatDate, isoDate } from "~/utils/format-date";
import { formatRecordNumber } from "~/utils/record-number";

defineProps<{
  title: string;
  date?: string;
  /** The post's place in the archive, oldest first */
  number?: number;
}>();
</script>

<template>
  <!-- The page's title block. The background already carries the mood, so
       this stays typographic: the title, then the line a case file would file
       it under, closed by the bleed. -->
  <header class="hero bleed">
    <h1>{{ title }}</h1>
    <p v-if="date || number" class="meta">
      <time v-if="date" :datetime="isoDate(date)">{{ formatDate(date) }}</time>
      <span v-if="number">{{ formatRecordNumber(number) }}</span>
    </p>
  </header>
</template>

<style scoped>
.hero {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-block: clamp(3rem, 8vw, 6rem) 1.75rem;
  margin-bottom: 3rem;
  border-bottom: 1px solid var(--color-rule);

  h1 {
    font-size: clamp(1.75rem, 1.2rem + 2vw, 2.5rem);
    line-height: 1.5;
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
</style>
