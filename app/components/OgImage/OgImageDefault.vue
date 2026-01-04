<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  siteName?: string;
}>();
</script>

<template>
  <div
    class="flex h-full w-full flex-col justify-between bg-[#1a1a1a] p-16 text-white"
  >
    <div class="flex flex-col gap-6">
    <h1 class="text-6xl font-bold leading-tight">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="text-3xl text-gray-300"
      >
        {{ description }}
      </p>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-2xl text-gray-400">{{ siteName || "naitokosuke blog" }}</span>
    </div>
  </div>
</template>
