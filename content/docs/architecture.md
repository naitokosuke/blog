# Architecture

このブログのアーキテクチャと設計思想。

## Tech Stack

| 技術 | 用途 |
|------|------|
| Nuxt 4 | フレームワーク |
| Nuxt Content v3 | Markdown コンテンツ管理 |
| Cloudflare Workers | ホスティング (Static) |
| Valibot | スキーマバリデーション |
| oxlint + ESLint | Lint |

## Directory Structure

```
blog/
├── app/
│   ├── assets/css/      # スタイル (main.css)
│   ├── components/      # Vue コンポーネント
│   │   └── content/prose/  # Markdown レンダリング
│   │       ├── heading/    # h2, h3, h4 コンポーネント
│   │       └── ProseImg.vue
│   ├── composables/     # Vue composables
│   ├── layouts/         # レイアウト (default.vue)
│   └── pages/           # ページ (index, [...slug])
├── content/             # Markdown 記事
├── modules/             # カスタム Nuxt モジュール
├── public/              # 静的ファイル
└── docs/                # プロジェクトドキュメント
```

## Key Modules

### @nuxt/content

Markdown ファイルを SQLite (native connector) でインデックス化し、高速にクエリ可能。

```ts
// content.config.ts
const posts = defineCollection({
  type: "page",
  source: "**",
  schema: v.object({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.optional(v.pipe(v.string(), v.isoDate())),
    tags: v.optional(v.array(v.string()), []),
    draft: v.optional(v.boolean(), false),
  }),
});
```

### @nuxtjs/seo

SEO 関連モジュール群:
- sitemap
- robots
- og-image (Zen Old Mincho フォント使用)
- schema.org

### @nuxtjs/color-mode

ダークモード対応。`classSuffix: ""` 設定で `.dark` クラスを使用。

### @nuxt/image

画像最適化。AVIF/WebP 形式、品質 80%。

### @nuxt/fonts

Web フォント管理。

### content-assets

カスタムモジュール。`content/` 内の画像を `public/` にコピーしてビルド時に利用可能にする。

## Design Decisions

### Component Naming Convention

Nuxt のコンポーネント自動解決を活用し、フォルダ構造でプレフィックスを表現:

```ts
// nuxt.config.ts
components: {
  dirs: [
    { path: "~/components/content/prose/heading", prefix: "Prose", pathPrefix: false },
    { path: "~/components/content/prose", prefix: "Prose", pathPrefix: false },
    { path: "~/components/OgImage", prefix: "OgImage", pathPrefix: false },
    { path: "~/components", pathPrefix: true },
  ],
}
```

### Static Generation

`nuxt generate` で完全な静的サイトを生成。Cloudflare Workers で配信。

### Markdown Rendering

Nuxt Content のデフォルト Prose コンポーネントをカスタマイズ:
- 見出し (h2-h4) にアンカーリンクを追加
- 画像を NuxtImg でラップして最適化
