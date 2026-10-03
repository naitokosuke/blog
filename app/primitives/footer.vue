<template>
  <footer>
    <div>
      <NuxtLink to="/" class="home">blog.naito.dev</NuxtLink>
      <p class="meta">&copy; {{ new Date().getFullYear() }} naitokosuke</p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  margin-top: 6rem;
  /* The column edge lives on the div, so the gutter goes on the footer */
  padding-inline: var(--gutter);

  div {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem 1.5rem;
    max-width: var(--content-width);
    margin: 0 auto;
    padding-block: 2rem 3rem;
    border-top: 1px solid var(--color-rule);
  }

  .home {
    font-size: 0.9375rem;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-text);
    }
  }
}
</style>
