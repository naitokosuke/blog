import { _api } from "@iconify/vue";

// With nuxt 4.5, `useRequestFetch().native` (used by @nuxt/icon's plugin) is a
// plain native fetch that cannot resolve the relative `/api/_nuxt_icon/...`
// URLs during SSR, so every icon logs "[Icon] failed to load icon" in dev.
// Route relative URLs through Nuxt's request-aware $fetch instead, which can
// call the local API internally. Absolute URLs (Iconify API fallback) keep
// using native fetch. `@iconify/vue` is deduped by @nuxt/icon via
// vite.resolve.dedupe, so this patches the same `_api` instance.
export default defineNuxtPlugin(() => {
  const requestFetch = useRequestFetch();

  _api.setFetch(async (input, init) => {
    const url
      = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (!url.startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    try {
      const data = await requestFetch<unknown>(url);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    catch {
      return new Response(null, { status: 404 });
    }
  });
});
