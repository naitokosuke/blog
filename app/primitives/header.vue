<script setup lang="ts">
import { computed } from "vue";
import { useColorMode } from "#imports";
import { useOverlay } from "~/primitives/overlay/use-overlay";

const colorMode = useColorMode();
const { fogEnabled, toggleFog, textureEnabled, toggleTexture } = useOverlay();

const isLight = computed(() => colorMode.value === "light");
</script>

<!-- Silent Hill plays with no HUD: the screen is all world. The menu is a few
     words left dim at the edge of sight; one comes up out of the dark only
     when you reach for it, and a layer switched off sinks back into it. -->
<template>
  <header>
    <nav>
      <NuxtLink class="logo" to="/">blog.naito.dev</NuxtLink>
      <div class="actions">
        <NuxtLink class="marked" external to="/feed.xml">
          <span aria-hidden="true">RSS</span>
          <span class="visually-hidden">RSS フィード</span>
        </NuxtLink>
        <NuxtLink class="marked" target="_blank" to="https://github.com/naitokosuke/blog">
          <span aria-hidden="true">GitHub</span>
          <span class="visually-hidden">GitHub のリポジトリ</span>
        </NuxtLink>
        <ClientOnly>
          <button
            v-if="isLight"
            class="marked"
            type="button"
            :aria-pressed="fogEnabled"
            aria-label="霧"
            :data-off="!fogEnabled || undefined"
            @click="toggleFog"
          >
            霧
          </button>
          <button
            v-else
            class="marked"
            type="button"
            :aria-pressed="textureEnabled"
            aria-label="壁"
            :data-off="!textureEnabled || undefined"
            @click="toggleTexture"
          >
            壁
          </button>
        </ClientOnly>
        <ThemeToggle />
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* No bar and no glass: the darkness (or the fog's paper) simply thickens at
   the top of the screen, the edge of the flashlight's reach. It sits above
   the fog canvas (z-index 100) and lets a little of it through, so the fog
   carries on under the menu instead of stopping at a line. */
header {
  position: sticky;
  inset-block-start: 0;
  z-index: var(--z-header);
  height: var(--header-height);
  --veil: color-mix(in oklab, var(--color-bg) 92%, transparent);
  background-color: var(--veil);

  /* The darkness runs on below the menu and only then thins out, so text
     scrolling up is swallowed before it reaches the words */
  &::after {
    content: "";
    position: absolute;
    inset: 100% 0 auto;
    height: 2.5rem;
    background: linear-gradient(to bottom, var(--veil), transparent);
    pointer-events: none;
  }

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
    font-family: var(--font-ui);
    font-size: 0.9375rem;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
    transition:
      color 0.6s,
      text-shadow 0.6s;

    &:hover {
      color: var(--color-text);
      text-shadow: 0 0 0.9em var(--glow);
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-inline-end: -0.75rem;
    font-family: var(--font-ui);
    font-size: 0.9375rem;
    letter-spacing: 0.08em;

    @media (width <= 480px) {
      gap: 0;
      margin-inline-end: -0.4rem;
    }
  }
}

/* Shared by every menu word, the theme toggle included (hence :deep) */
:deep(.marked) {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding-inline: 0.75rem;
  background: none;
  border: none;
  font: inherit;
  letter-spacing: inherit;
  /* Left at the edge of sight until reached for */
  color: color-mix(in oklab, var(--color-text-secondary) 70%, transparent);
  cursor: pointer;
  /* Slow, as things come up out of fog: never a snap */
  transition:
    color 0.6s,
    text-shadow 0.6s,
    opacity 0.6s;

  &:is(:hover, :focus-visible) {
    color: var(--color-text);
    text-shadow: 0 0 0.9em var(--glow);
    outline: none;
  }

  /* A layer switched off sinks back into the dark */
  &[data-off] {
    opacity: 0.35;
  }

  /* A phone has room for the name and four words only if they sit close */
  @media (width <= 480px) {
    min-width: 40px;
    padding-inline: 0.4rem;
  }
}
</style>
