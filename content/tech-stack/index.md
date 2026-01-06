---
title: "blog.naito.dev を支える技術スタック"
description: "このブログを支える技術スタックについて。Nuxt 4、Nuxt Content v3、Cloudflare Workers などを採用している。"
date: "2026-01-06"
tags: ["nuxt", "cloudflare"]
---

このブログの技術スタックについて書く。

## 概要

- Nuxt
  - Nuxt Content
  - Nuxt SEO
  - Nuxt Image
  - Nuxt Fonts
  - Nuxt Icon
  - Nuxt Color Mode
- Cloudflare Workers
- Valibot


## フレームワーク: Nuxt 4

Nuxt を選んだ理由は、個人ブログに必要な機能が揃っているから。

- SSG (Static Site Generation) のサポート
- Nuxt Content による Markdown 管理
- Nuxt SEO による SEO 対応
- Nuxt Image による画像最適化

Vue.js のエコシステムを使いたかったというのもある。業務でも Vue/Nuxt を使っているので、ブログでも同じ技術スタックを使うことで学びを深められる。

## コンテンツ管理: Nuxt Content v3

記事は Markdown で書いている。Nuxt Content v3 は SQLite でインデックスを作成し、高速にクエリできる。

```
content/
├── making-vuefes-2025/
│   ├── index.md
│   └── images/
└── tech-stack/
    └── index.md
```

記事ごとにディレクトリを切り、画像は `images/` ディレクトリに配置する。この構造により、記事と関連画像をまとめて管理できる。

### frontmatter

```yaml
---
title: "記事タイトル"
description: "記事の説明"
date: "2026-01-06"
tags: ["tag1", "tag2"]
---
```

frontmatter のスキーマは Valibot で定義している。型安全に記事のメタデータを扱える。

## ホスティング: Cloudflare Workers

Cloudflare Workers (Static Assets) でホスティングしている。

`nuxt generate` で静的サイトを生成し、GitHub Actions 経由で Wrangler を使ってデプロイしている。

```bash
# 静的サイト生成
nr generate

# デプロイ
npx wrangler pages deploy .output/public
```

Cloudflare を選んだ理由は、無料枠が十分で、エッジでの配信が速いから。日本からのアクセスも問題ない。

## SEO: Nuxt SEO

Nuxt SEO モジュール群を使っている。

- **sitemap**: sitemap.xml の自動生成
- **robots**: robots.txt の管理
- **og-image**: OG 画像の動的生成
- **schema.org**: 構造化データの出力

OG 画像は satori を使って動的に生成している。記事ごとにタイトルを含んだ画像が自動で作られる。

## スタイリング: Pure CSS

CSS フレームワークは使わず、Pure CSS で書いている。CSS Variables でテーマを管理し、ダークモードにも対応している。

テーマは SILENT HILL にインスパイアされた「霧の中で技術文書を読む体験」をコンセプトにしている。

## 開発体験

### Nuxt モジュール

開発体験向上のために以下のモジュールを使用している。

- Nuxt Hints
- Nuxt ESLint

### Linter / Formatter

- ESLint (with Nuxt ESLint)
- Oxlint

Oxlint は Rust 製で高速。ESLint と併用している。

### パッケージマネージャー

pnpm を使っている。@antfu/ni を入れているので、`ni` や `nr` コマンドで操作できる。

## 今後の展開

サードパーティスクリプトの管理に Nuxt Scripts を導入したい。Google Analytics などを使う際に、パフォーマンスとプライバシーを考慮したスクリプト読み込みができる。

## まとめ

Nuxt 4 + Nuxt Content v3 + Cloudflare Workers という構成。モダンな技術スタックで、開発体験も良い。

記事は Markdown で書けて、デプロイは GitHub に push するだけ。個人ブログにはちょうどいい構成だと思う。
