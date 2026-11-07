<!-- The words of a PlayStation game were drawn at 320 or 640 pixels across and
     blown up to the screen, so every stroke came out in square steps. These
     filters do the same to live text: sample one pixel per block, then grow
     each sample into a square that fills the block. The text stays text (it
     selects, copies, and is read aloud); only its picture is coarsened.
     The block of #pixel-N is N CSS pixels: a 1×1 sample near the block's
     center is tiled across the element, kept where the text is, and dilated
     by (N - 1) / 2 into an N×N square. The steps are sized to the type the
     way a 480-line screen sized them: a glyph some 14 to 20 blocks tall. -->
<template>
  <svg aria-hidden="true" class="pixel-filters" focusable="false">
    <filter id="pixel-3" color-interpolation-filters="sRGB" height="100%" width="100%" x="0" y="0">
      <feFlood height="1" width="1" x="1" y="1" />
      <feComposite height="3" width="3" />
      <feTile result="grid" />
      <feComposite in="SourceGraphic" in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="1" />
    </filter>
    <filter id="pixel-2" color-interpolation-filters="sRGB" height="100%" width="100%" x="0" y="0">
      <feFlood height="1" width="1" x="0" y="0" />
      <feComposite height="2" width="2" />
      <feTile result="grid" />
      <feComposite in="SourceGraphic" in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="0.5" />
    </filter>
    <!-- For long reading: the 2px steps laid over the sharp drawing rather
         than replacing it, so the edges still stair-step but every stroke
         keeps its true shape. k2 is how much of the coarse picture shows. -->
    <filter
      id="pixel-2-soft"
      color-interpolation-filters="sRGB"
      height="100%"
      width="100%"
      x="0"
      y="0"
    >
      <feFlood height="1" width="1" x="0" y="0" />
      <feComposite height="2" width="2" />
      <feTile result="grid" />
      <feComposite in="SourceGraphic" in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="0.5" result="coarse" />
      <feComposite in="coarse" in2="SourceGraphic" k2="0.55" k3="0.45" operator="arithmetic" />
    </filter>
  </svg>
</template>

<style scoped>
/* Takes no room; the filters are only referenced from CSS */
.pixel-filters {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
