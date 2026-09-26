<script setup lang="ts">
defineProps<{
  title: string;
  showShare?: boolean;
}>();
</script>

<template>
  <figure>
    <!-- JPEG copy of /og-background.png (that PNG stays for the build-time OG
         image, where the file is never shipped to a reader). -->
    <img
      src="/hero-background.jpg"
      :alt="title"
      width="1536"
      height="1024"
      fetchpriority="high"
      decoding="async"
    />
    <figcaption>
      <span class="title">{{ title }}</span>
      <ShareButtons v-if="showShare" :title />
    </figcaption>
  </figure>
</template>

<style scoped>
figure {
  position: relative;
  width: 100%;
  max-width: var(--content-width);
  height: 300px;
  margin-block: 0 2rem;
  margin-inline: auto;
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
