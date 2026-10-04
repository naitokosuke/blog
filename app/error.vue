<script setup lang="ts">
import { computed } from "vue";
import type { NuxtError } from "#app";
import { clearError, useSeoMeta } from "#imports";

const props = defineProps<{ error: NuxtError }>();

const notFound = computed(() => props.error.statusCode === 404);

useSeoMeta({
  title: () => (notFound.value ? "ページが見つかりません" : "ページを表示できませんでした"),
  robots: "noindex",
});

function goHome(): void {
  void clearError({ redirect: "/" });
}
</script>

<!-- Inside the site's own layout, so a wrong link stays in the same world
     instead of dropping the reader onto a blank framework page -->
<template>
  <NuxtLayout>
    <div class="error">
      <header>
        <p class="meta">{{ error.statusCode }}</p>
        <h1>{{ notFound ? "ページが見つかりません" : "ページを表示できませんでした" }}</h1>
      </header>
      <p v-if="notFound">
        URL が間違っているか、記事が移動または削除された可能性があります。
        記事の一覧から探してください。
      </p>
      <p v-else>
        読み込みの途中で問題が起きました。時間をおいて再読み込みするか、記事の一覧に戻ってください。
      </p>
      <button type="button" @click="goHome">記事の一覧へ戻る</button>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.error {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-bottom: 4rem;

  header {
    padding-top: clamp(3rem, 8vw, 6rem);
    margin-bottom: 2.5rem;
  }

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

  p:not(.meta) {
    margin-bottom: 2rem;
  }

  button {
    display: inline-block;
    min-height: 44px;
    padding: 0.5rem 0;
    background: none;
    border: none;
    font: inherit;
    letter-spacing: inherit;
    color: var(--color-text);
    cursor: pointer;
    transition: color 0.2s;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-decoration-color: color-mix(in oklab, currentcolor 40%, transparent);
    text-underline-offset: 0.3em;

    &:hover {
      color: var(--color-accent-hover);
    }
  }
}
</style>
