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
  <div
    v-if="status === 'pending'"
    class="card"
    role="status"
    aria-label="リンク情報を読み込み中"
  >
    <!-- title, description ×2, domain -->
    <div>
      <div
        v-for="n in 4"
        :key="n"
        class="placeholder"
      />
    </div>
    <div class="thumbnail" />
  </div>

  <!-- Error fallback -->
  <NuxtLink
    v-else-if="status === 'error' || !data"
    :to="url"
    class="fallback"
    target="_blank"
  >
    {{ url }}
    <span class="sr-only">(新しいタブで開きます)</span>
  </NuxtLink>

  <!-- Success -->
  <NuxtLink
    v-else
    :to="data.url || url"
    class="card"
    target="_blank"
  >
    <div>
      <strong>{{ data.title }}</strong>
      <p v-if="data.description">{{ data.description }}</p>
      <small>
        <img
          v-if="data.favicon"
          :src="data.favicon"
          alt=""
          width="16"
          height="16"
          loading="lazy"
        >
        <span>{{ data.siteName || domain }}</span>
      </small>
    </div>
    <div
      v-if="data.image"
      class="thumbnail"
    >
      <img
        :src="data.image"
        alt=""
        loading="lazy"
      >
    </div>
    <span class="sr-only">(新しいタブで開きます)</span>
  </NuxtLink>
</template>

<style scoped>
.card {
  display: grid;
  grid-template-columns: 1fr auto;
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

    .thumbnail {
      background-color: var(--color-border);
      opacity: 0.2;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
  }

  > div:first-of-type {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1rem 1.25rem;
    min-width: 0;
  }

  strong {
    font-size: 1rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  p {
    font-size: 0.8125rem;
    line-height: 1.5;
    margin: 0;
    color: var(--color-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  small {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: auto;
    font-size: 0.75rem;
    color: var(--color-text-secondary);

    img {
      width: 16px;
      height: 16px;
      border-radius: 2px;
      border: none;
      margin: 0;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .thumbnail {
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

  @media (width <= 768px) {
    grid-template-columns: 1fr;

    .thumbnail {
      grid-row: 1;
      width: 100%;
      height: 160px;
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

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.4;
  }
}
</style>
