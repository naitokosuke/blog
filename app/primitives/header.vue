<script setup lang="ts">
import { computed } from "vue";
import { useColorMode } from "#imports";
import { useOverlay } from "~/primitives/overlay/use-overlay";

const colorMode = useColorMode();
const { fogEnabled, toggleFog, textureEnabled, toggleTexture } = useOverlay();

const isLight = computed(() => colorMode.value === "light");
</script>

<template>
  <header>
    <nav>
      <NuxtLink to="/" class="logo"> blog.naito.dev </NuxtLink>
      <div class="actions">
        <NuxtLink to="/feed.xml" external aria-label="RSS フィード">
          <AppIcon name="rss" size="20" />
        </NuxtLink>
        <NuxtLink
          to="https://github.com/naitokosuke/blog"
          target="_blank"
          aria-label="GitHub のリポジトリ"
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
        </ClientOnly>
        <ThemeToggle />
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* Opaque, and above the fog canvas (z-index 100): the header is a solid
   band, so however far the page scrolls nothing of the background shows
   through or around it */
header {
  position: sticky;
  top: 0;
  z-index: 110;
  height: var(--header-height);
  background-color: var(--color-bg);

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
    margin-right: -10px;

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
  }
}
</style>
