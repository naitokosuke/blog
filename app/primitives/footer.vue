<template>
  <!-- One quiet line at the foot of the column. RSS and the source live in the
       header, so nothing here links anywhere. -->
  <footer>
    <div>
      <p class="meta">&copy; {{ new Date().getFullYear() }} naitokosuke</p>
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
