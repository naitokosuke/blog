import { queryCollection } from "@nuxt/content/server";

export default defineEventHandler(async (event) => {
  const siteUrl = "https://blog.naito.dev";
  const siteName = "naitokosuke blog";
  const siteDescription = "ナイトウコウスケのブログ";

  const posts = await queryCollection(event, "content")
    .where("path", "NOT LIKE", "/")
    .where("extension", "=", "md")
    .order("date", "DESC")
    .all();

  const lastBuildDate = posts.length > 0 && posts[0]?.date
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .filter(post => !post.draft)
    .map((post) => {
      const pubDate = post.date ? new Date(post.date).toUTCString() : "";
      const link = `${siteUrl}${post.path}`;

      return `    <item>
      <title><![CDATA[${post.title || "Untitled"}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${post.description || ""}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>ja</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  setHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
  return rss;
});
