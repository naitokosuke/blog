<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="copyright">
        &copy; {{ new Date().getFullYear() }} naitokosuke
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

.footer-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}

.copyright {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
