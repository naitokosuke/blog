<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  siteName?: string;
}>();
</script>

<template>
  <div
    :style="{
      display: 'flex',
      width: '100%',
      height: '100%',
      position: 'relative',
    }"
  >
    <!-- Background image -->
    <img
      src="/og-background.png"
      :style="{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }"
    >

    <!-- Dark overlay for text readability -->
    <div
      :style="{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }"
    />

    <!-- Content -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '60px',
        position: 'relative',
      }"
    >
      <div
        :style="{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }"
      >
        <div
          :style="{
            fontSize: '52px',
            fontWeight: '700',
            lineHeight: '1.3',
            color: '#f0ece8',
            fontFamily: 'Tsunagi Gothic, sans-serif',
          }"
        >
          {{ title }}
        </div>
        <div
          v-if="description"
          :style="{
            fontSize: '24px',
            color: '#c0b8b0',
            lineHeight: '1.5',
            fontFamily: 'Tsunagi Gothic, sans-serif',
          }"
        >
          {{ description }}
        </div>
      </div>

      <!-- Footer -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }"
      >
        <div
          :style="{
            width: '100px',
            height: '6px',
            backgroundColor: '#8b2020',
          }"
        />
        <div
          :style="{
            fontSize: '22px',
            color: '#908880',
            fontFamily: 'Tsunagi Gothic, sans-serif',
          }"
        >
          {{ siteName || 'naitokosuke blog' }}
        </div>
      </div>
    </div>
  </div>
</template>
