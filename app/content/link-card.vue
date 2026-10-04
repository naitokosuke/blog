<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { useFetch } from "#imports";
import { safeUrl } from "~/utils/safe-url";

const props = defineProps<{
  url: string;
}>();

const { data, status } = useFetch("/api/ogp", {
  query: { url: props.url },
});

const imageError = ref(false);
const faviconError = ref(false);

const thumbImg = useTemplateRef<HTMLImageElement>("thumbImg");
const faviconImg = useTemplateRef<HTMLImageElement>("faviconImg");

// When the image fails before hydration (e.g. SSR-rendered <img>), the
// native error event fires before the @error listener is attached and is
// missed. Re-check on mount: a finished load with no intrinsic size means
// the image is broken.
function isBroken(el: HTMLImageElement | null): boolean {
  return !!el && el.complete && el.naturalWidth === 0;
}

onMounted(() => {
  if (isBroken(thumbImg.value)) imageError.value = true;
  if (isBroken(faviconImg.value)) faviconError.value = true;
});

function onImageError(): void {
  imageError.value = true;
}

function onFaviconError(): void {
  faviconError.value = true;
}

const domain = computed(() => {
  try {
    return new URL(props.url).hostname;
  } catch {
    return props.url;
  }
});
</script>

<template>
  <!-- Loading -->
  <div v-if="status === 'pending'" class="card" role="status" aria-label="リンク情報を読み込み中">
    <!-- title, description*2, domain -->
    <div>
      <div v-for="n in 4" :key="n" class="placeholder" />
    </div>
    <div class="thumbnail" />
  </div>

  <!-- Error fallback -->
  <NuxtLink v-else-if="status === 'error' || !data" :to="url" class="fallback" target="_blank">
    {{ url }}
    <span class="sr-only">(新しいタブで開きます)</span>
  </NuxtLink>

  <!-- Success -->
  <NuxtLink v-else :to="safeUrl(data.url) || url" class="card" target="_blank">
    <div>
      <strong>{{ data.title }}</strong>
      <p v-if="data.description">{{ data.description }}</p>
      <small>
        <img
          v-if="data.favicon && !faviconError"
          ref="faviconImg"
          :src="safeUrl(data.favicon)"
          alt=""
          width="16"
          height="16"
          loading="lazy"
          @error="onFaviconError"
        />
        <span>{{ data.siteName || domain }}</span>
      </small>
    </div>
    <div v-if="data.image && !imageError" class="thumbnail">
      <img ref="thumbImg" :src="safeUrl(data.image)" alt="" loading="lazy" @error="onImageError" />
    </div>
    <span class="sr-only">(新しいタブで開きます)</span>
  </NuxtLink>
</template>

<style scoped>
/* A citation set apart by space and smaller type, not a box: the column has
   no boxes and no rules. The page's own colours win over the linked site's -
   its OG image is pulled into the ink and rust of the current world and only
   warms on hover or focus. */
.card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.25rem;
  align-items: center;
  margin-block: 2.5rem;
  text-decoration: none;
  letter-spacing: 0.03em;
  color: var(--color-text);

  &:is(:hover, :focus-visible) strong {
    color: var(--color-accent-hover);
  }

  &[role="status"] {
    pointer-events: none;

    .thumbnail {
      background-color: var(--color-bg-secondary);
    }
  }

  > div:first-of-type {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  strong {
    /* A card title, not prose emphasis: no highlighter wash */
    background-image: none;
    font-size: 1rem;
    line-height: 1.6;
    transition: color 0.2s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  p {
    font-size: 0.8125rem;
    line-height: 1.6;
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
    gap: 0.5rem;
    margin-top: 0.25rem;
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);

    img {
      width: 14px;
      height: 14px;
      border: none;
      margin: 0;
      filter: grayscale(1);
      opacity: 0.8;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .thumbnail {
    position: relative;
    width: 168px;
    aspect-ratio: 1.91;
    overflow: hidden;
    background-color: var(--color-bg-secondary);

    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border: none;
      border-radius: 0;
      margin: 0;
      /* Ink on paper: the image keeps its shapes, the paper keeps its colour */
      filter: grayscale(1) sepia(0.35) contrast(0.95);
      mix-blend-mode: multiply;
      opacity: 0.85;
      transition:
        filter 0.5s,
        opacity 0.5s;
    }
  }

  &:is(:hover, :focus-visible) .thumbnail img {
    filter: grayscale(0.35) sepia(0.2) contrast(1);
    opacity: 1;
  }

  @media (width <= 768px) {
    gap: 1rem;

    .thumbnail {
      width: 96px;
    }

    p {
      display: none;
    }
  }
}

/* 裏: the image is printed onto a rusted plate. Multiplied over the oxide, an
   OG image's white paper becomes the rust and only its dark strokes remain,
   so a bright thumbnail can no longer be the loudest thing in the column. */
:global(.dark .card .thumbnail) {
  background-color: color-mix(in oklab, var(--color-rust) 42%, var(--color-bg));
}

:global(.dark .card .thumbnail img) {
  filter: grayscale(1) contrast(1.2);
  mix-blend-mode: multiply;
  opacity: 0.9;
}

:global(.dark .card:is(:hover, :focus-visible) .thumbnail img) {
  filter: grayscale(0.5) contrast(1.1);
  opacity: 1;
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

/* Still lines where the text will land; no pulse - the role="status" already
   says it is loading */
.placeholder {
  height: 0.875em;
  width: 90%;
  margin-block: 0.25em;
  background-color: var(--color-bg-secondary);

  &:nth-child(1) {
    width: 70%;
    height: 1em;
  }

  &:nth-child(3) {
    width: 50%;
  }

  &:nth-child(4) {
    width: 30%;
    height: 0.75em;
  }
}
</style>
