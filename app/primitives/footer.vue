<script setup lang="ts">
import { useState } from "#imports";

// The year the page was rendered, carried in the payload so hydration reads
// the same value even when a prerendered page is opened in a later year
const year = useState("footer-year", () => new Date().getFullYear());
</script>

<template>
  <!-- One quiet line at the foot of the column. RSS and the source live in the
       header, so nothing here links anywhere. -->
  <footer>
    <div>
      <p class="meta">&copy; {{ year }} naitokosuke</p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  margin-top: 8rem;
  /* The column edge lives on the div, so the gutter goes on the footer */
  padding-inline: var(--gutter);

  div {
    max-width: var(--content-width);
    margin: 0 auto;
    padding-bottom: 2.5rem;
  }
}
</style>
