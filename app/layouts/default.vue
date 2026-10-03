<template>
  <div>
    <ClientOnly>
      <!-- Decorative full-screen canvases: they can only start after
           hydration anyway, so keep their shaders out of the entry chunk -->
      <LazyBackgroundTexture />
      <LazyFogOverlay />
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

  main {
    width: 100%;
    max-width: calc(var(--content-width) + var(--gutter) * 2);
    margin: 0 auto;
    padding: 0 var(--gutter);
  }
}

/* The texture is loudest exactly where the reading column sits on a wide
   screen. A soft band of darkness under the column keeps the words on calm
   ground while the edges stay fully visible. The whole selector sits inside
   :global() - Vue drops whatever follows a partial `:global(.dark)`, which
   would land these rules on <html> itself. */
:global(.dark .layout::before) {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  --band: calc(var(--content-width) / 2 + var(--gutter));
  background: linear-gradient(
    90deg,
    transparent calc(50% - var(--band) - 14rem),
    color-mix(in oklab, var(--color-bg) 58%, transparent) calc(50% - var(--band)),
    color-mix(in oklab, var(--color-bg) 58%, transparent) calc(50% + var(--band)),
    transparent calc(50% + var(--band) + 14rem)
  );
}
</style>
