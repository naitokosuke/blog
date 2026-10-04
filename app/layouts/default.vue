<template>
  <div>
    <ClientOnly>
      <!-- Decorative full-screen canvases: they can only start after
           hydration anyway, so keep their shaders out of the entry chunk -->
      <LazyBackgroundTexture />
      <LazyFogOverlay />
    </ClientOnly>
    <a href="#main" class="skip-link">本文へ移動</a>
    <div class="layout">
      <Header />
      <main id="main" tabindex="-1">
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
  /* No z-index here on purpose: a stacking context would trap the sticky
     header below the fog canvas (z-index 100). Without one, the header's own
     z-index competes at the root and stays on top, and the content still
     paints over the texture canvas, which sits at z-index -1. */
  position: relative;

  main {
    outline: none;
    width: 100%;
    max-width: calc(var(--content-width) + var(--gutter) * 2);
    margin: 0 auto;
    padding: 0 var(--gutter);
  }
}

/* The texture is loudest exactly where the reading column sits on a wide
   screen. Darkness pooled under the column keeps the words on calm ground,
   and only there: it fades out within a few rem of the column's edge, so the
   margins on either side show the wall at full strength. It is an ellipse
   that only ever fades, never a strip with edges, so it reads as the room
   being darker there rather than as a panel behind the text. The whole
   selector sits inside :global() - Vue drops whatever follows a partial
   `:global(.dark)`, which would land these rules on <html> itself. */
:global(.dark .layout::before) {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  --band: calc(var(--content-width) / 2 + var(--gutter));
  --pool: color-mix(in oklab, var(--color-bg) 58%, transparent);
  background: radial-gradient(
    calc(var(--band) + 5rem) 130% at 50% 45%,
    var(--pool) 0,
    var(--pool) 78%,
    transparent 100%
  );
}

/* On a phone the column is the whole screen; pooling darkness under all of it
   would put out the wall entirely. Lighter, so the wall still shows through. */
@media (width <= 768px) {
  :global(.dark .layout::before) {
    --pool: color-mix(in oklab, var(--color-bg) 42%, transparent);
  }
}
</style>
