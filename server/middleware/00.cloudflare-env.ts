import { defineEventHandler } from "#imports";

export default defineEventHandler((event) => {
  const cloudflareEnv = event.context.cloudflare?.env;
  if (cloudflareEnv) {
    // nuxt-studio uses STUDIO_GITHUB_CLIENT_ID directly in process.env
    if (cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID) {
      process.env.STUDIO_GITHUB_CLIENT_ID = cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID;
    }
    if (cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET) {
      process.env.STUDIO_GITHUB_CLIENT_SECRET = cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET;
    }
  }
});
