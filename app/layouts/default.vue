<template>
  <div>
    <ClientOnly>
      <BackgroundTexture />
      <FogOverlay />
    </ClientOnly>
    <div class="layout">
      <Header />
      <main>
        <slot />
      </main>
      <Footer />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

main {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1rem;
}

@media (width <= 768px) {
  main {
    padding: 0 1.25rem;
  }
}
</style>
