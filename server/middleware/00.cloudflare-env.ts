export default defineEventHandler((event) => {
  const cloudflareEnv = event.context.cloudflare?.env;
  if (cloudflareEnv) {
    // Map Cloudflare env vars to Nuxt runtime config format
    if (cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID) {
      process.env.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID = cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID;
    }
    if (cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET) {
      process.env.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET = cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET;
    }
  }
});
