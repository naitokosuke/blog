<!-- The words of a PlayStation game were drawn at 320 or 640 pixels across and
     blown up to the screen, so every stroke came out in square steps. These
     filters do the same to live text: take one sample per block and fill the
     block with it. The text stays text (it selects, copies, and is read
     aloud); only its picture is coarsened. The steps are sized to the type
     the way a 480-line screen sized them: a glyph some 14 to 20 blocks tall.

     The block of #pixel-N is N CSS pixels:
       grid    a 1×1 cell in the corner of every N×N block
       sample  the text kept on those cells, then dilated by 1 and cut back to
               the cells, so each cell holds one even value (on a dense screen
               a CSS pixel is several device pixels, and they would otherwise
               keep the strokes' fine detail and streak)
       fill    the sample grown to the whole block

     Written to draw the same in Chromium and WebKit (Safari, and every
     browser on iOS):
       no primitive has an x or y; on an HTML element WebKit measures them
         from somewhere other than the element's corner, so a cell placed at
         0,0 fell outside and the words came out blank
       every dilate radius is a whole number; WebKit drops a radius of 0.5,
         so a 2px block is filled by copying the sample, not by dilating

     #pixel-phone-xN is a block of about 1.5 CSS pixels for a phone, whose
     type is smaller and whose screen is N device pixels to the CSS pixel.
     The block is a whole number of device pixels (3 on a 2x screen, 1.5px;
     5 on a 3x one, 1.67px, as 4.5 would not tile evenly). Its cell is one
     device pixel, so the sample holds one value as it is, and a dilate of 1
     grows it over the block, spilling a device pixel into each neighbour
     where the darker one wins; filling by offset copies instead drew the
     same but halved the frame rate of a scroll in WebKit. WebKit rounds a
     tile to whole CSS pixels, so the tile is N blocks wide (a whole number
     of CSS pixels) and its N cells are placed by offset copies. The CSS
     picks the one matching the screen. -->
<script setup lang="ts">
const fine = [
  { n: 2, block: 3 },
  { n: 3, block: 5 },
].flatMap(({ n, block }) =>
  [false, true].map((soft) => ({
    id: `pixel-phone-x${n}${soft ? "-soft" : ""}`,
    soft,
    cell: 1 / n,
    tile: block,
    // Where the other cells of a tile sit, after its first
    cells: Array.from({ length: n - 1 }, (_, i) => ((i + 1) * block) / n),
  })),
);
</script>

<template>
  <svg aria-hidden="true" class="pixel-filters" focusable="false">
    <filter id="pixel-3" color-interpolation-filters="sRGB" height="100%" width="100%" x="0" y="0">
      <feFlood height="1" width="1" />
      <feComposite height="3" width="3" />
      <feTile />
      <!-- Shifted to the middle of the block, which a dilate of 1 fills -->
      <feOffset dx="1" dy="1" result="grid" />
      <feComposite in="SourceGraphic" in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="1" />
      <feComposite in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="1" />
    </filter>
    <filter id="pixel-2" color-interpolation-filters="sRGB" height="100%" width="100%" x="0" y="0">
      <feFlood height="1" width="1" />
      <feComposite height="2" width="2" />
      <feTile result="grid" />
      <feComposite in="SourceGraphic" in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="1" />
      <feComposite in2="grid" operator="in" result="sample" />
      <feOffset dx="1" in="sample" result="right" />
      <feOffset dy="1" in="sample" result="down" />
      <feOffset dx="1" dy="1" in="sample" result="across" />
      <feMerge>
        <feMergeNode in="sample" />
        <feMergeNode in="right" />
        <feMergeNode in="down" />
        <feMergeNode in="across" />
      </feMerge>
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
      <feFlood height="1" width="1" />
      <feComposite height="2" width="2" />
      <feTile result="grid" />
      <feComposite in="SourceGraphic" in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="1" />
      <feComposite in2="grid" operator="in" result="sample" />
      <feOffset dx="1" in="sample" result="right" />
      <feOffset dy="1" in="sample" result="down" />
      <feOffset dx="1" dy="1" in="sample" result="across" />
      <feMerge result="coarse">
        <feMergeNode in="sample" />
        <feMergeNode in="right" />
        <feMergeNode in="down" />
        <feMergeNode in="across" />
      </feMerge>
      <feComposite in="coarse" in2="SourceGraphic" k2="0.55" k3="0.45" operator="arithmetic" />
    </filter>
    <filter
      v-for="f in fine"
      :id="f.id"
      :key="f.id"
      color-interpolation-filters="sRGB"
      height="100%"
      width="100%"
      x="0"
      y="0"
    >
      <feFlood :height="f.cell" :width="f.cell" />
      <feComposite :height="f.tile" :width="f.tile" />
      <feTile result="tiled" />
      <feOffset v-for="c in f.cells" :key="c" :dx="c" in="tiled" :result="`gx${c}`" />
      <feMerge result="columns">
        <feMergeNode in="tiled" />
        <feMergeNode v-for="c in f.cells" :key="c" :in="`gx${c}`" />
      </feMerge>
      <feOffset v-for="c in f.cells" :key="c" :dy="c" in="columns" :result="`gy${c}`" />
      <feMerge result="grid">
        <feMergeNode in="columns" />
        <feMergeNode v-for="c in f.cells" :key="c" :in="`gy${c}`" />
      </feMerge>
      <feComposite in="SourceGraphic" in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="1" :result="f.soft ? 'coarse' : undefined" />
      <feComposite
        v-if="f.soft"
        in="coarse"
        in2="SourceGraphic"
        k2="0.55"
        k3="0.45"
        operator="arithmetic"
      />
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
