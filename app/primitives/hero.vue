<script setup lang="ts">
import { formatDate, isoDate } from "~/utils/format-date";

defineProps<{
  title: string;
  date?: string;
}>();
</script>

<template>
  <!-- The page's title block. The background already carries the mood, so
       this stays typographic: a log-style date and the title on a ruled line. -->
  <header class="hero">
    <p v-if="date" class="meta">
      <time :datetime="isoDate(date)">{{ formatDate(date) }}</time>
    </p>
    <h1>{{ title }}</h1>
  </header>
</template>

<style scoped>
.hero {
  position: relative;
  max-width: var(--content-width);
  margin-inline: auto;
  padding-block: clamp(3rem, 8vw, 6rem) 2rem;
  margin-bottom: 3rem;
  border-bottom: 1px solid var(--color-rule);

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 2.5rem;
    height: 1px;
    background-color: var(--color-blood);
  }

  .meta {
    margin-bottom: 1rem;
  }

  h1 {
    font-size: clamp(1.75rem, 1.2rem + 2vw, 2.5rem);
    line-height: 1.5;
    letter-spacing: 0.06em;
    font-feature-settings: "palt";
    text-wrap: balance;
  }
}
</style>
