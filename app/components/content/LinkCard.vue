<script setup lang="ts">
const props = defineProps<{
  url: string;
}>();

const { data, status } = useFetch("/api/ogp", {
  query: { url: props.url },
});

const domain = computed(() => {
  try {
    return new URL(props.url).hostname;
  }
  catch {
    return props.url;
  }
});
</script>

<template>
  <!-- Loading -->
  <div v-if="status === 'pending'" class="card" role="status" aria-label="リンク情報を読み込み中">
    <!-- title, description ×2, domain -->
    <div class="body">
      <div v-for="n in 4" :key="n" class="placeholder" />
    </div>
    <div class="thumbnail placeholder-bg" />
  </div>

  <!-- Error fallback -->
  <NuxtLink v-else-if="status === 'error' || !data" :to="url" class="fallback" target="_blank">
    {{ url }}
    <span class="sr-only">(新しいタブで開きます)</span>
  </NuxtLink>

  <!-- Success -->
  <NuxtLink v-else :to="data.url || url" class="card" target="_blank">
    <div class="body">
      <strong class="title">{{ data.title }}</strong>
      <span v-if="data.description" class="description">{{ data.description }}</span>
      <span class="meta">
        <img
          v-if="data.favicon"
          :src="data.favicon"
          alt=""
          class="favicon"
          width="16"
          height="16"
          loading="lazy"
        >
        <span class="domain">{{ data.siteName || domain }}</span>
      </span>
    </div>
    <div v-if="data.image" class="thumbnail">
      <img :src="data.image" alt="" loading="lazy">
    </div>
    <span class="sr-only">(新しいタブで開きます)</span>
  </NuxtLink>
</template>

<style scoped>
.card {
  display: flex;
  margin-block: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-secondary);
  overflow: hidden;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-accent-hover);
  }

  &[role="status"] {
    pointer-events: none;
  }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1rem 1.25rem;
    min-width: 0;
  }

  .title {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .description {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: auto;
  }

  .favicon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: none;
    margin: 0;
  }

  .domain {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .thumbnail {
    flex-shrink: 0;
    width: 230px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border: none;
      border-radius: 0;
      margin: 0;
    }
  }
}

.fallback {
  display: block;
  margin-block: 1.5rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.placeholder {
  height: 1em;
  width: 90%;
  background-color: var(--color-border);
  border-radius: 4px;
  opacity: 0.2;
  animation: skeleton-pulse 1.5s ease-in-out infinite;

  &:nth-child(1) {
    width: 70%;
    height: 1.125em;
  }

  &:nth-child(3) {
    width: 50%;
  }

  &:nth-child(4) {
    width: 30%;
    height: 0.75em;
    margin-top: auto;
  }
}

.placeholder-bg {
  background-color: var(--color-border);
  opacity: 0.2;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.4;
  }
}

@media (width <= 768px) {
  .card {
    flex-direction: column-reverse;

    .thumbnail {
      width: 100%;
      height: 160px;
    }
  }
}
</style>
