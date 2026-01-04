<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  siteName?: string;
}>();
</script>

<template>
  <div class="og-container">
    <!-- 背景レイヤー -->
    <div class="bg-base" />
    <div class="bg-rust" />
    <div class="bg-blood" />
    <div class="bg-vignette" />

    <!-- コンテンツ -->
    <div class="content">
      <div class="text-area">
        <h1 class="title">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="description"
        >
          {{ description }}
        </p>
      </div>
      <div class="footer">
        <span class="site-name">{{ siteName || "blog.naito.dev" }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.og-container {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Tsunagi Gothic", sans-serif;
  overflow: hidden;
}

/* 闘: 湿度のある暗褐色ベース */
.bg-base {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    #0d0a09 0%,
    #1a1412 25%,
    #0d0a09 50%,
    #1a1412 75%,
    #0d0a09 100%
  );
}

/* 錆: 茶〜オレンジのグラデーション */
.bg-rust {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 85%, rgba(69, 35, 15, 0.6) 0%, transparent 50%),
    radial-gradient(ellipse 70% 50% at 85% 20%, rgba(90, 45, 20, 0.5) 0%, transparent 45%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(61, 48, 42, 0.4) 0%, transparent 60%),
    radial-gradient(ellipse 100% 80% at 30% 30%, rgba(75, 40, 25, 0.3) 0%, transparent 50%);
}

/* 血: 控えめな暗い赤のアクセント */
.bg-blood {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 40% 35% at 90% 80%, rgba(139, 30, 30, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse 30% 25% at 10% 15%, rgba(100, 20, 20, 0.3) 0%, transparent 45%),
    radial-gradient(ellipse 60% 40% at 70% 60%, rgba(80, 25, 25, 0.2) 0%, transparent 55%);
}

/* ビネット効果 */
.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(0, 0, 0, 0.5) 100%);
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 64px;
  color: #d4c8b8;
}

.text-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title {
  font-size: 64px;
  font-weight: 700;
  line-height: 1.2;
  color: #d4c8b8;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
}

.description {
  font-size: 32px;
  color: #8a7f73;
  line-height: 1.4;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-name {
  font-size: 28px;
  color: #5c524a;
  letter-spacing: 0.05em;
}
</style>
