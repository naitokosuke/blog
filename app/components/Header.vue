<script setup lang="ts">
const colorMode = useColorMode();
const { fogEnabled, toggleFog, textureEnabled, toggleTexture } = useOverlay();

const isLight = computed(() => colorMode.value === "light");
</script>

<template>
  <header>
    <nav>
      <NuxtLink
        to="/"
        class="logo"
      >
        blog.naito.dev
      </NuxtLink>
      <div class="actions">
        <ClientOnly>
          <button
            v-if="isLight"
            class="overlay-toggle"
            :aria-label="fogEnabled ? 'Clear fog' : 'Show fog'"
            @click="toggleFog"
          >
            <Icon
              :name="fogEnabled ? 'lucide:wind' : 'lucide:cloud-fog'"
              size="20"
            />
          </button>
          <button
            v-else
            class="overlay-toggle"
            :aria-label="textureEnabled ? 'Hide texture' : 'Show texture'"
            @click="toggleTexture"
          >
            <Icon
              :name="textureEnabled ? 'lucide:eye-off' : 'lucide:eye'"
              size="20"
            />
          </button>
        </ClientOnly>
        <NuxtLink
          to="/feed.xml"
          class="icon-link"
          aria-label="RSS Feed"
        >
          <Icon
            name="lucide:rss"
            size="20"
          />
        </NuxtLink>
        <NuxtLink
          to="https://github.com/naitokosuke/blog"
          target="_blank"
          class="icon-link"
          aria-label="GitHub"
        >
          <Icon
            name="mdi:github"
            size="24"
          />
        </NuxtLink>
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

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: var(--max-width);
    height: 100%;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);

    &:hover {
      color: var(--color-accent);
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-link {
    display: flex;
    align-items: center;
    color: var(--color-text);

    &:hover {
      color: var(--color-accent);
    }
  }

  .overlay-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    border-radius: 8px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: var(--color-bg-secondary);
      color: var(--color-text);
    }
  }
}
</style>
