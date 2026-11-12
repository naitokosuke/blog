<script setup lang="ts">
import { computed } from "vue";
import { useColorMode } from "#imports";
import { useOverlay } from "~/primitives/overlay/use-overlay";

const colorMode = useColorMode();
const { fogEnabled, toggleFog, textureEnabled, toggleTexture, pixelEnabled, togglePixel } =
  useOverlay();

const isLight = computed(() => colorMode.value === "light");
</script>

<template>
  <header>
    <nav>
      <NuxtLink class="logo" to="/"> blog.naito.dev </NuxtLink>
      <div class="actions">
        <NuxtLink aria-label="RSS フィード" external to="/feed.xml">
          <AppIcon name="rss" size="20" />
        </NuxtLink>
        <NuxtLink
          aria-label="GitHub のリポジトリ"
          target="_blank"
          to="https://github.com/naitokosuke/blog"
        >
          <AppIcon name="github" size="20" />
        </NuxtLink>
        <ClientOnly>
          <button
            v-if="isLight"
            type="button"
            :aria-label="fogEnabled ? '霧を晴らす' : '霧を戻す'"
            @click="toggleFog"
          >
            <AppIcon :name="fogEnabled ? 'wind' : 'cloud-fog'" size="20" />
          </button>
          <button
            v-else
            type="button"
            :aria-label="textureEnabled ? '背景を隠す' : '背景を戻す'"
            @click="toggleTexture"
          >
            <AppIcon :name="textureEnabled ? 'eye-off' : 'eye'" size="20" />
          </button>
          <button
            type="button"
            :aria-label="pixelEnabled ? '画面の粗さを戻す' : '画面を粗くする'"
            @click="togglePixel"
          >
            <AppIcon :name="pixelEnabled ? 'type' : 'grid-2x2'" size="20" />
          </button>
        </ClientOnly>
        <ThemeToggle />
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* Mostly opaque, with the wall (or the fog) showing faintly through so the
   header belongs to the same world as the page instead of being cut off
   from it. The blur keeps text scrolling underneath from reading through.
   It sits above the fog canvas (z-index 100), so the fog is seen through it
   rather than painted over it. */
header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  height: var(--header-height);
  /* The dark wall is dim to begin with, so 裏 can let more of it through */
  --veil: 72%;
  background-color: color-mix(in oklab, var(--color-bg) var(--veil), transparent);
  backdrop-filter: blur(14px);

  nav {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    max-width: calc(var(--content-width) + var(--gutter) * 2);
    height: 100%;
    margin: 0 auto;
    padding: 0 var(--gutter);
  }

  .logo {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: 1.0625rem;
    letter-spacing: 0.08em;
    color: var(--color-text);

    &:hover {
      color: var(--color-accent-hover);
    }
  }

  .actions {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    gap: 0.25rem;
    /* Pull the last button's padding out so its glyph sits on the column edge */
    margin-inline-end: -10px;

    a,
    button {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      background: none;
      border: none;
      border-radius: 8px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition:
        background-color 0.2s,
        color 0.2s;

      &:hover {
        background-color: var(--color-bg-secondary);
        color: var(--color-text);
      }
    }

    /* The hint is the button's own aria-label, surfacing faintly beneath it
       the way words rise out of the dark - no OS tooltip box. :deep() reaches
       ThemeToggle's button, which lives in its own component. */
    :deep(:is(a, button)[aria-label]) {
      position: relative;

      &::after {
        content: attr(aria-label);
        position: absolute;
        top: calc(100% + 6px);
        inset-inline-end: 0;
        padding: 0.3em 0.6em;
        border-radius: 4px;
        background-color: color-mix(in oklab, var(--color-bg) 82%, transparent);
        backdrop-filter: blur(8px);
        color: var(--color-text-secondary);
        font-family: "Zen Old Mincho", ui-serif, serif;
        font-size: 0.75rem;
        font-weight: 400;
        letter-spacing: 0.06em;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:focus-visible::after {
        opacity: 1;
      }

      @media (hover: hover) {
        &:hover::after {
          opacity: 1;
          transition-delay: 0.3s;
        }
      }
    }
  }
}

/* The whole selector sits inside :global() - Vue drops whatever follows a
   partial `:global(.dark)` */
:global(.dark header) {
  --veil: 58%;
}
</style>
