<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink
        to="/"
        class="logo"
      >
        blog.naito.dev
      </NuxtLink>
      <ThemeToggle />
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
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
}

.logo:hover {
  color: var(--color-accent);
}

</style>
