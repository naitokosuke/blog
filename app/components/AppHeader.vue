<script setup lang="ts">
const navItems = [
  { label: "Home", to: "/" },
  { label: "Blog", to: "/blog" },
  { label: "Tags", to: "/tags" },
  { label: "About", to: "/about" },
];
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink to="/" class="logo">
        Blog
      </NuxtLink>
      <nav class="nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
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

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-accent);
}

@media (max-width: 640px) {
  .nav {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.75rem;
  }
}
</style>
