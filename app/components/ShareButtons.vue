<script setup lang="ts">
const props = defineProps<{
  title: string;
  url?: string;
}>();

const runtimeConfig = useRuntimeConfig();

const shareUrl = computed(() => {
  if (props.url) return props.url;
  if (import.meta.client) {
    return window.location.href;
  }
  return `${runtimeConfig.public.siteUrl}${useRoute().path}`;
});

const xShareUrl = computed(() => {
  const text = `『${props.title}』- blog.naito.dev`;
  const params = new URLSearchParams({
    url: shareUrl.value,
    text,
    hashtags: "naitokosuke_blog",
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
});

const copied = ref(false);

async function copyUrl() {
  const textToCopy = `『${props.title}』- blog.naito.dev\n${shareUrl.value}`;
  await navigator.clipboard.writeText(textToCopy);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="share-buttons">
    <a
      :href="xShareUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="share-button"
      aria-label="X(Twitter)でシェア"
    >
      <Icon
        name="mdi:twitter"
        size="20"
      />
    </a>
    <button
      type="button"
      class="share-button"
      :aria-label="copied ? 'コピーしました' : 'URLをコピー'"
      @click="copyUrl"
    >
      <Icon
        v-if="copied"
        name="mdi:check"
        size="20"
      />
      <Icon
        v-else
        name="mdi:link-variant"
        size="20"
      />
    </button>
  </div>
</template>

<style scoped>
.share-buttons {
  display: flex;
  gap: 0.5rem;
}

.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: var(--color-accent);
    color: var(--color-bg);
  }
}
</style>
