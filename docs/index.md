# blog.naito.dev

naitokosuke のブログ。SILENT HILL にインスパイアされた「血と霧と錆と闇」のダークテーマ。

## Documentation

| ドキュメント | 説明 |
|-------------|------|
| [Architecture](./architecture.md) | アーキテクチャと技術スタック |
| [Components](./components.md) | コンポーネント設計と命名規則 |
| [Content Authoring](./content-authoring.md) | 記事の書き方 |
| [Deployment](./deployment.md) | デプロイと CI/CD |
| [Typography](./typography.md) | タイポグラフィ設計 |
| [Theme](./theme/index.md) | デザインシステム |

## Quick Start

```bash
# 依存関係のインストール
ni

# 開発サーバー起動
nr dev

# 静的サイト生成
nr generate

# Lint
nr lint

# フォーマット
nr fmt
```

## Tech Stack

- **Framework**: Nuxt 4
- **Content**: Nuxt Content v3
- **Hosting**: Cloudflare Workers
- **Styling**: Pure CSS (CSS Variables)
- **Lint**: oxlint + ESLint

## Design Philosophy

> 霧の中で技術文書を読む体験
> UI は存在感を消し、文章だけが静かに浮かび上がる

詳細は [Theme](./theme/index.md) を参照。
