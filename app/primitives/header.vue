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
        <!-- What is behind the page, named in one character and lit while it
             is there - the same reading as 表|裏 beside it, which lights the
             world you are in -->
        <ClientOnly>
          <button
            v-if="isLight"
            type="button"
            class="layer"
            :class="{ on: fogEnabled }"
            :aria-pressed="fogEnabled"
            :title="fogEnabled ? '霧を晴らす' : '霧を戻す'"
            @click="toggleFog"
          >
            <span aria-hidden="true">霧</span>
            <span class="visually-hidden">背景の霧</span>
          </button>
          <button
            v-else
            type="button"
            class="layer"
            :class="{ on: textureEnabled }"
            :aria-pressed="textureEnabled"
            :title="textureEnabled ? '壁を隠す' : '壁を戻す'"
            @click="toggleTexture"
          >
            <span aria-hidden="true">壁</span>
            <span class="visually-hidden">背景の壁</span>
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
    /* Pull the last control's padding out so its glyph sits on the column edge */
    margin-right: -0.5rem;

    button {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--color-text);
      }
    }

    /* Lit while the layer is there, like the current world in 表|裏 */
    .layer {
      font-size: 1.0625rem;
      line-height: 1;

      &.on {
        color: var(--color-text);
      }

      &:hover {
        color: var(--color-accent-hover);
      }
    }
  }
}
</style>
