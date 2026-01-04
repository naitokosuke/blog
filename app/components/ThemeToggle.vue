<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed({
  get: () => colorMode.value === "dark",
  set: () => {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
</script>

<template>
  <ClientOnly>
    <button
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="isDark = !isDark"
    >
      {{ isDark ? "明" : "暗" }}
    </button>
    <template #fallback>
      <button aria-label="Toggle theme">
        暗
      </button>
    </template>
  </ClientOnly>
</template>

<style scoped>
button {
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
  font-family: "Noto Serif JP", serif;
  font-size: 18px;
  font-weight: 500;

  &:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
  }
}
</style>
