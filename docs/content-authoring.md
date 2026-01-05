# Content Authoring

記事の書き方とコンテンツ管理。

## Directory Structure

```
content/
└── {slug}/
    ├── index.md      # 記事本文
    └── images/       # 記事内で使用する画像
        ├── image1.png
        └── image2.jpg
```

## Frontmatter

```yaml
---
title: 記事タイトル
description: 記事の説明（OG description にも使用）
date: 2024-01-01
tags:
  - nuxt
  - vue
draft: false
---
```

### Required Fields

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `title` | string | 記事タイトル |

### Optional Fields

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `description` | string | - | 記事の説明 |
| `date` | ISO 8601 | - | 公開日 |
| `tags` | string[] | `[]` | タグ |
| `draft` | boolean | `false` | 下書きフラグ |

## Images

### 配置

記事と同じフォルダ内の `images/` に配置:

```
content/my-article/
├── index.md
└── images/
    └── screenshot.png
```

### 参照

Markdown 内で相対パスで参照:

```markdown
![スクリーンショット](/my-article/images/screenshot.png)
```

### ビルド時の処理

`content-assets` モジュールが `content/*/images/` を `public/` にコピー。
`@nuxt/image` が最適化（WebP, AVIF 変換）。

## Markdown Features

Nuxt Content v3 (MDC) の機能が使用可能:

- 見出しに自動でアンカーリンク
- コードブロックのシンタックスハイライト
- テーブル
- etc.
