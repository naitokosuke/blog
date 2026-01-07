export default defineEventHandler((event) => {
  const cloudflareEnv = event.context.cloudflare?.env;
  if (cloudflareEnv) {
    if (cloudflareEnv.STUDIO_GITHUB_CLIENT_ID) {
      process.env.STUDIO_GITHUB_CLIENT_ID = cloudflareEnv.STUDIO_GITHUB_CLIENT_ID;
    }
    if (cloudflareEnv.STUDIO_GITHUB_CLIENT_SECRET) {
      process.env.STUDIO_GITHUB_CLIENT_SECRET = cloudflareEnv.STUDIO_GITHUB_CLIENT_SECRET;
    }
  }
});
