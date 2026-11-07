<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useSiteConfig } from "#imports";
import { safeUrl } from "~/utils/safe-url";

const { title, url } = defineProps<{
  title: string;
  url?: string;
}>();

const siteConfig = useSiteConfig();

const shareUrl = computed(() => {
  if (url !== undefined) return url;
  if (import.meta.client) {
    return window.location.href;
  }
  return `${siteConfig.url}${useRoute().path}`;
});

const xShareUrl = computed(() => {
  const text = `『${title}』- blog.naito.dev`;
  const params = new URLSearchParams({
    url: shareUrl.value,
    text,
    hashtags: "naitokosuke_blog",
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
});

const copied = ref(false);
let copyRun = 0;
let resetTimer: ReturnType<typeof setTimeout> | undefined;

async function copyUrl() {
  const run = ++copyRun;
  const textToCopy = `『${title}』- blog.naito.dev\n${shareUrl.value}`;
  await navigator.clipboard.writeText(textToCopy);
  // A later click owns the status line now
  if (run !== copyRun) return;
  copied.value = true;
  // Restart the countdown so an earlier click cannot clear it early
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<!-- A quiet line of words under the article, not a row of bordered glyphs -->
<template>
  <div class="share-buttons">
    <a :href="safeUrl(xShareUrl)" rel="noopener noreferrer" target="_blank">X で共有</a>
    <button type="button" @click="copyUrl">URL をコピー</button>
    <span class="status" role="status">{{ copied ? "コピーしました" : "" }}</span>
  </div>
</template>

<style scoped>
.share-buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 1.5rem;
  font-size: 0.9375rem;
}

a,
button {
  /* The words stay small; the hit area does not */
  display: inline-block;
  min-height: 44px;
  padding-block: 0.625rem;
  background: none;
  border: none;
  font: inherit;
  letter-spacing: inherit;
  color: var(--color-text-secondary);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: color-mix(in oklab, currentcolor 35%, transparent);
  text-underline-offset: 0.35em;
  transition:
    color 0.2s,
    text-decoration-color 0.2s;

  &:hover {
    color: var(--color-accent-hover);
    text-decoration-color: currentcolor;
  }
}

.status {
  font-size: 0.8125rem;
  color: var(--color-accent-hover);
}
</style>
