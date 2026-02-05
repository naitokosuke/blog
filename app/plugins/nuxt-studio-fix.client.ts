export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  // nuxt-studio 要素が追加されるのを監視して z-index を設定
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

  // 既に存在する場合も対応
  const existing = document.querySelector("nuxt-studio") as HTMLElement | null;
  if (existing) {
    existing.style.position = "fixed";
    existing.style.zIndex = "99999";
    existing.style.bottom = "0";
    existing.style.left = "0";
    observer.disconnect();
  }
});
