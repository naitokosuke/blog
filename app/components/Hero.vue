<script setup lang="ts">
defineProps<{
  title: string;
  showShare?: boolean;
}>();
</script>

<template>
  <figure>
    <img
      src="/og-background.png"
      :alt="title"
    >
    <figcaption>
      <span class="title">{{ title }}</span>
      <ShareButtons
        v-if="showShare"
        :title="title"
      />
    </figcaption>
  </figure>
</template>

<style scoped>
figure {
  position: relative;
  width: 100%;
  height: 300px;
  margin-bottom: 2rem;
  overflow: hidden;
  border-radius: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  figcaption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    color: var(--color-text);
    background: linear-gradient(transparent, var(--color-bg));

    .title {
      font-size: 2rem;
      font-weight: 700;
    }
  }
}
</style>
