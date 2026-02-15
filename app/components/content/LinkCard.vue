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
  <div class="link-card-wrapper">
    <!-- Loading -->
    <div v-if="status === 'pending'" class="link-card link-card--skeleton" role="status" aria-label="リンク情報を読み込み中">
      <div class="link-card__body">
        <div class="skeleton-line skeleton-line--title" />
        <div class="skeleton-line skeleton-line--desc" />
        <div class="skeleton-line skeleton-line--desc skeleton-line--short" />
        <div class="skeleton-line skeleton-line--domain" />
      </div>
      <div class="link-card__image skeleton-image" />
    </div>

    <!-- Error fallback -->
    <a v-else-if="status === 'error' || !data" :href="url" target="_blank" rel="noopener noreferrer">
      {{ url }}
      <span class="sr-only">(新しいタブで開きます)</span>
    </a>

    <!-- Success -->
    <a v-else :href="data.url || url" class="link-card" target="_blank" rel="noopener noreferrer">
      <div class="link-card__body">
        <strong class="link-card__title">{{ data.title }}</strong>
        <span v-if="data.description" class="link-card__description">{{ data.description }}</span>
        <span class="link-card__meta">
          <img
            v-if="data.favicon"
            :src="data.favicon"
            alt=""
            class="link-card__favicon"
            width="16"
            height="16"
            loading="lazy"
          >
          <span class="link-card__domain">{{ data.siteName || domain }}</span>
        </span>
      </div>
      <div v-if="data.image" class="link-card__image">
        <img :src="data.image" alt="" loading="lazy">
      </div>
      <span class="sr-only">(新しいタブで開きます)</span>
    </a>
  </div>
</template>

<style scoped>
.link-card-wrapper {
  margin-block: 1.5rem;
}

.link-card {
  display: flex;
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

  &--skeleton {
    pointer-events: none;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1rem 1.25rem;
    min-width: 0;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__description {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: auto;
  }

  &__favicon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: none;
    margin: 0;
  }

  &__domain {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__image {
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

.skeleton-line {
  height: 1em;
  background-color: var(--color-border);
  border-radius: 4px;
  opacity: 0.2;
  animation: skeleton-pulse 1.5s ease-in-out infinite;

  &--title {
    width: 70%;
    height: 1.125em;
  }

  &--desc {
    width: 90%;
  }

  &--short {
    width: 50%;
  }

  &--domain {
    width: 30%;
    height: 0.75em;
    margin-top: auto;
  }
}

.skeleton-image {
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
  .link-card {
    flex-direction: column-reverse;

    &__image {
      width: 100%;
      height: 160px;
    }
  }
}
</style>
