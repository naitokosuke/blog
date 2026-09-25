<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === "dark");

function toggleTheme(): void {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    >
      {{ isDark ? "表" : "裏" }}
    </button>
    <template #fallback>
      <button type="button" aria-label="Toggle theme">暗</button>
    </template>
  </ClientOnly>
</template>

<style scoped>
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
  font-family: "Noto Serif JP", serif;
  font-size: 18px;
  font-weight: 500;

  &:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
  }
}
</style>
