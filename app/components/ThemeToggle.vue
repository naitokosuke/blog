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
  <button
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="isDark = !isDark"
  >
    <Icon v-if="isDark" name="lucide:sun" size="20" />
    <Icon v-else name="lucide:moon" size="20" />
  </button>
</template>

<style scoped>
.theme-toggle {
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
}

.theme-toggle:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}
</style>
