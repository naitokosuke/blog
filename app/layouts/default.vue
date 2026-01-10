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
    <main>
      <slot />
    </main>
    <Footer />
    <StudioEditButton />
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

main {
  flex: 1;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1rem;
  overflow-y: auto;
}

@media (width <= 768px) {
  main {
    padding: 0 1.25rem;
  }
}
</style>
