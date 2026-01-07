import { useRuntimeConfig, defineEventHandler } from "#imports";

export default defineEventHandler((event) => {
  const cloudflareEnv = event.context.cloudflare?.env;
  if (cloudflareEnv) {
    const config = useRuntimeConfig(event);

    // Update runtimeConfig with Cloudflare env vars
    if (cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID) {
      config.studio = config.studio || {};
      config.studio.auth = config.studio.auth || {};
      config.studio.auth.github = config.studio.auth.github || {};
      config.studio.auth.github.clientId = cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID;
    }
    if (cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET) {
      config.studio = config.studio || {};
      config.studio.auth = config.studio.auth || {};
      config.studio.auth.github = config.studio.auth.github || {};
      config.studio.auth.github.clientSecret = cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET;
    }
  }
});
