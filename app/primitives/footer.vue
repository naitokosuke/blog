<template>
  <footer>
    <div>
      <p>
        &copy; {{ new Date().getFullYear() }} naitokosuke
      </p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: transparent;

  div {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 1rem;
    text-align: center;
  }

  p {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
}
</style>
