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
        <NuxtLink to="/feed.xml" external aria-label="RSS Feed">
          <AppIcon name="rss" size="20" />
        </NuxtLink>
        <NuxtLink to="https://github.com/naitokosuke/blog" target="_blank" aria-label="GitHub">
          <AppIcon name="github" size="20" />
        </NuxtLink>
        <ClientOnly>
          <button
            v-if="isLight"
            type="button"
            :aria-label="fogEnabled ? 'Clear fog' : 'Show fog'"
            @click="toggleFog"
          >
            <AppIcon :name="fogEnabled ? 'wind' : 'cloud-fog'" size="20" />
          </button>
          <button
            v-else
            type="button"
            :aria-label="textureEnabled ? 'Hide texture' : 'Show texture'"
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
header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--header-height);
  background-color: var(--color-header-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in oklab, var(--color-text) 8%, transparent);

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
    /* Pull the last button's padding out so its glyph sits on the column edge */
    margin-right: -9px;

    a,
    button {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--color-text);
      }
    }
  }
}
</style>
