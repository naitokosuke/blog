<script setup lang="ts">
const props = defineProps<{
  title: string;
  imagePath?: string;
}>();

const DEFAULT_HERO_IMAGE = "/og-background.png";

const imageRef = ref<HTMLImageElement | null>(null);
const currentImage = ref(DEFAULT_HERO_IMAGE);

onMounted(() => {
  if (props.imagePath) {
    const img = new Image();
    img.onload = () => {
      currentImage.value = props.imagePath!;
    };
    img.onerror = () => {
      currentImage.value = DEFAULT_HERO_IMAGE;
    };
    img.src = props.imagePath;
  }
});

watch(() => props.imagePath, (newPath) => {
  if (newPath) {
    const img = new Image();
    img.onload = () => {
      currentImage.value = newPath;
    };
    img.onerror = () => {
      currentImage.value = DEFAULT_HERO_IMAGE;
    };
    img.src = newPath;
  }
  else {
    currentImage.value = DEFAULT_HERO_IMAGE;
  }
});
</script>

<template>
  <div class="hero">
    <img
      ref="imageRef"
      :src="currentImage"
      :alt="title"
      class="hero-image"
    >
    <h1 class="hero-title">
      {{ title }}
    </h1>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 300px;
  margin-bottom: 2rem;
  overflow: hidden;
  border-radius: 8px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 2rem;
  font-size: 2rem;
  color: white;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}
</style>
