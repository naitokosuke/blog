<script setup lang="ts">
const { enabled, enable } = usePreviewMode();

const isStudioContext = computed(() => {
  if (import.meta.client) {
    return (
      window.self !== window.top
      || (window as unknown as { __NUXT_STUDIO__?: boolean }).__NUXT_STUDIO__
    );
  }
  return false;
});

const showButton = computed(() => !enabled.value && isStudioContext.value);
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <button
        v-if="showButton"
        class="studio-edit-button"
        aria-label="編集モードを開始"
        @click="enable"
      >
        編
      </button>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.studio-edit-button {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, transform 0.2s;
  font-family: "Noto Serif JP", serif;
  font-size: 18px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
