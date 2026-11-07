<!-- The words of a PlayStation game were drawn at 320 or 640 pixels across and
     blown up to the screen, so every stroke came out in square steps. These
     filters do the same to live text: take one sample per block and fill the
     block with it. The text stays text (it selects, copies, and is read
     aloud); only its picture is coarsened. The steps are sized to the type
     the way a 480-line screen sized them: a glyph some 14 to 20 blocks tall.

     The sizes live in `tuning` (pixel-tuning.ts); the CSS (assets/css/main.css) picks
     which filter each kind of text takes, by role, so changing a size never
     touches it.

     A block of N CSS pixels:
       grid    a 1×1 cell in every N×N block, at its middle
       sample  the text kept on those cells, then dilated by 1 and cut back to
               the cells, so each cell holds one even value (on a dense screen
               a CSS pixel is several device pixels, and they would otherwise
               keep the strokes' fine detail and streak)
       fill    the sample grown to the whole block: dilated for an odd N,
               dilated and then copied one pixel across and down for an even
               one

     A phone block is a whole number of device pixels, for a screen of D
     device pixels to the CSS pixel (1.5 CSS pixels would be 4.5 on a 3x
     screen and could not tile evenly). Its cell is one device pixel, so the
     sample holds one value as it is, and a dilate grows it over the block,
     spilling into each neighbour where the darker one wins; filling by
     offset copies instead drew the same but halved the frame rate of a
     scroll in WebKit. WebKit rounds a tile to whole CSS pixels, so the tile
     is D blocks wide and its D cells are placed by offset copies.

     Written to draw the same in Chromium and WebKit (Safari, and every
     browser on iOS):
       no primitive has an x or y; on an HTML element WebKit measures them
         from somewhere other than the element's corner, so a cell placed at
         0,0 fell outside and the words came out blank
       every dilate radius is a whole number of CSS pixels; WebKit drops a
         radius of 0.5, so even blocks are finished by copying, not dilating

     Each text filter has a -soft twin for small print and reading text: the
     steps laid over the sharp drawing rather than replacing it, so the edges
     still stair-step but every stroke keeps its true shape. -->
<script setup lang="ts">
import { tuning } from "./pixel-tuning";

const half = (n: number) => Math.floor((n - 1) / 2);

// A block of a whole number of CSS pixels
const css = (id: string, size: number) => ({
  id,
  cell: 1,
  tile: size,
  cells: [] as number[],
  middle: half(size),
  sampleDilate: true,
  radius: half(size),
  copy: size % 2 === 0,
});

// A block of `block` device pixels on a screen of `density`
const device = (id: string, density: number, block: number) => ({
  id,
  cell: 1 / density,
  tile: block,
  cells: Array.from({ length: density - 1 }, (_, i) => ((i + 1) * block) / density),
  middle: 0,
  sampleDilate: false,
  radius: Math.ceil(half(block) / density),
  copy: false,
});

type Block = ReturnType<typeof css>;

const withSoft = (f: Block) => [
  { ...f, soft: false },
  { ...f, id: `${f.id}-soft`, soft: true },
];

// Every stage a block skips hands on its input by name rather than through
// an empty primitive: WebKit's scroll slows with each primitive it runs
const named = (f: Block & { soft: boolean }) => {
  const tiles = f.cells.length ? "rows" : "tiled";
  const grid = f.middle ? "grid" : tiles;
  const sample = f.sampleDilate ? "sample" : "kept";
  const grown = f.radius ? "grown" : sample;
  const coarse = f.copy ? "coarse" : grown;
  return { ...f, tiles, grid, sample, grown, coarse };
};

const filters = [
  { ...css("pixel-title", tuning.wide.title), soft: false },
  ...withSoft(css("pixel-text", tuning.wide.text)),
  { ...css("pixel-phone-title", tuning.phone.title), soft: false },
  ...Object.entries(tuning.phone.text).flatMap(([density, block]) =>
    withSoft(device(`pixel-phone-x${density}`, Number(density), block)),
  ),
].map(named);
</script>

<template>
  <svg aria-hidden="true" class="pixel-filters" focusable="false">
    <filter
      v-for="f in filters"
      :id="f.id"
      :key="f.id"
      color-interpolation-filters="sRGB"
      height="100%"
      width="100%"
      x="0"
      y="0"
    >
      <!-- grid -->
      <feFlood :height="f.cell" :width="f.cell" />
      <feComposite :height="f.tile" :width="f.tile" />
      <feTile result="tiled" />
      <template v-if="f.cells.length">
        <feOffset v-for="c in f.cells" :key="c" :dx="c" in="tiled" :result="`gx${c}`" />
        <feMerge result="columns">
          <feMergeNode in="tiled" />
          <feMergeNode v-for="c in f.cells" :key="c" :in="`gx${c}`" />
        </feMerge>
        <feOffset v-for="c in f.cells" :key="c" :dy="c" in="columns" :result="`gy${c}`" />
        <feMerge result="rows">
          <feMergeNode in="columns" />
          <feMergeNode v-for="c in f.cells" :key="c" :in="`gy${c}`" />
        </feMerge>
      </template>
      <feOffset v-if="f.middle" :dx="f.middle" :dy="f.middle" :in="f.tiles" result="grid" />
      <!-- sample -->
      <feComposite in="SourceGraphic" :in2="f.grid" operator="in" result="kept" />
      <template v-if="f.sampleDilate">
        <feMorphology in="kept" operator="dilate" radius="1" />
        <feComposite :in2="f.grid" operator="in" result="sample" />
      </template>
      <!-- fill -->
      <feMorphology
        v-if="f.radius"
        :in="f.sample"
        operator="dilate"
        :radius="f.radius"
        result="grown"
      />
      <template v-if="f.copy">
        <feOffset dx="1" :in="f.grown" result="right" />
        <feOffset dy="1" :in="f.grown" result="down" />
        <feOffset dx="1" dy="1" :in="f.grown" result="across" />
        <feMerge result="coarse">
          <feMergeNode :in="f.grown" />
          <feMergeNode in="right" />
          <feMergeNode in="down" />
          <feMergeNode in="across" />
        </feMerge>
      </template>
      <feComposite
        v-if="f.soft"
        :in="f.coarse"
        in2="SourceGraphic"
        :k2="tuning.softMix"
        :k3="1 - tuning.softMix"
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
