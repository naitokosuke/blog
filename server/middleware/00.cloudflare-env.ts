/**
 * Cloudflare Workers 環境変数を process.env にブリッジするミドルウェア
 *
 * ## なぜこれが必要か
 *
 * 1. Cloudflare Workers では process.env が通常の Node.js のように動作しない
 *    環境変数は event.context.cloudflare.env 経由でのみアクセス可能
 *    @see https://github.com/nuxt/nuxt/issues/14011
 *    @see https://github.com/nuxt/nuxt/issues/25047
 *
 * 2. nuxt-studio モジュールは process.env.STUDIO_GITHUB_CLIENT_ID を直接参照する
 *    @see https://nuxt.com/modules/studio
 *
 * 3. Nuxt の runtimeConfig は Cloudflare preset では環境変数を自動解決しない
 *
 * ## 環境変数の命名規則
 *
 * - Cloudflare 側: NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID（Nuxt の命名規則に従う）
 * - nuxt-studio 側: STUDIO_GITHUB_CLIENT_ID（モジュールが期待する名前）
 *
 * このミドルウェアで変換を行うことで、Cloudflare の設定を Nuxt 標準に保ちつつ
 * nuxt-studio の要件も満たしている
 */
export default defineEventHandler((event) => {
  const cloudflareEnv = event.context.cloudflare?.env;
  if (cloudflareEnv) {
    if (cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID) {
      process.env.STUDIO_GITHUB_CLIENT_ID = cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID;
    }
    if (cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET) {
      process.env.STUDIO_GITHUB_CLIENT_SECRET = cloudflareEnv.NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET;
    }
  }
});
