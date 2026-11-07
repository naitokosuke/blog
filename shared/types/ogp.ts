// What /api/ogp answers with. Shared so the link card names the type instead of
// relying on Nitro's route inference, which tools outside Nuxt's own type
// generation (Vize's checker) see as `any`.
export interface OgpData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  favicon: string;
}
