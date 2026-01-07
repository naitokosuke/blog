export default defineEventHandler((event) => {
  const cloudflareEnv = event.context.cloudflare?.env;
  return {
    hasCloudflareContext: !!event.context.cloudflare,
    hasEnv: !!cloudflareEnv,
    envKeys: cloudflareEnv ? Object.keys(cloudflareEnv) : [],
    processEnvClientId: process.env.STUDIO_GITHUB_CLIENT_ID ? "set" : "not set",
    processEnvClientSecret: process.env.STUDIO_GITHUB_CLIENT_SECRET ? "set" : "not set",
  };
});
