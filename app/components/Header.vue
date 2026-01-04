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
        <NuxtLink
          to="https://github.com/naitokosuke/blog"
          target="_blank"
          class="github-link"
          aria-label="GitHub"
        >
          <Icon name="mdi:github" size="24" />
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
  z-index: 100;
  height: var(--header-height);
  background-color: transparent;

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

  .github-link {
    display: flex;
    align-items: center;
    color: var(--color-text);

    &:hover {
      color: var(--color-accent);
    }
  }
}
</style>
