# Architecture

このブログのアーキテクチャと設計思想。

## Tech Stack

| 技術 | 用途 |
|------|------|
| Nuxt 4 | フレームワーク |
| Nuxt Content v3 | Markdown コンテンツ管理 |
| Cloudflare Workers | ホスティング (Static) |
| Valibot | スキーマバリデーション |

## Directory Structure

```
blog/
├── app/
│   ├── components/      # Vue コンポーネント
│   │   ├── content/     # Nuxt Content 用
│   │   │   └── prose/   # Markdown レンダリング
│   │   │       └── heading/
│   │   └── OgImage/     # OG 画像生成
│   ├── composables/     # Vue composables
│   ├── layouts/         # レイアウト
│   ├── pages/           # ページ
│   └── assets/          # CSS, フォント
├── content/             # Markdown 記事
├── modules/             # カスタム Nuxt モジュール
├── public/              # 静的ファイル
└── docs/                # プロジェクトドキュメント
```

## Key Modules

### @nuxt/content

Markdown ファイルを SQLite でインデックス化し、高速にクエリ可能。

```ts
// content.config.ts
const posts = defineCollection({
  type: "page",
  source: "**",
  schema: v.object({
    title: v.string(),
    date: v.optional(v.pipe(v.string(), v.isoDate())),
    // ...
  }),
});
```

### @nuxtjs/seo

SEO 関連モジュール群:
- sitemap
- robots
- og-image
- schema.org

### content-assets

カスタムモジュール。`content/` 内の画像を `public/` にコピーしてビルド時に利用可能にする。

## Design Decisions

### Component Naming Convention

Nuxt のコンポーネント自動解決を活用し、フォルダ構造でプレフィックスを表現:

```
OgImage/Default.vue  → OgImageDefault
prose/heading/h2.vue → ProseH2 (nuxt.config.ts で設定)
```

### Static Generation

`nuxt generate` で完全な静的サイトを生成。Cloudflare Workers で配信。

### Markdown Rendering

Nuxt Content のデフォルト Prose コンポーネントをカスタマイズし、見出しにアンカーリンクを追加。
