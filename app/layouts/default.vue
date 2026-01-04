<template>
  <div class="layout">
    <ClientOnly>
      <BackgroundTexture />
      <FogOverlay />
      <template #fallback>
        <div />
      </template>
    </ClientOnly>
    <Header />
    <div class="content">
      <main>
        <slot />
      </main>
      <Footer />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

main {
  flex: 1;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
