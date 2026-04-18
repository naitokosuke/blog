export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  // Watch for the nuxt-studio element to be added and set its z-index
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement && node.tagName.toLowerCase() === "nuxt-studio") {
          node.style.position = "fixed";
          node.style.zIndex = "99999";
          node.style.bottom = "0";
          node.style.left = "0";
          observer.disconnect();
          return;
        }
      }
    }
  });

  observer.observe(document.body, { childList: true });

  // Handle the case where the element already exists
  const existing = document.querySelector("nuxt-studio") as HTMLElement | null;
  if (existing) {
    existing.style.position = "fixed";
    existing.style.zIndex = "99999";
    existing.style.bottom = "0";
    existing.style.left = "0";
    observer.disconnect();
  }
});
