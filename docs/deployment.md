# Deployment

デプロイと CI/CD。

## Hosting

Cloudflare Workers (Static Assets) でホスティング。

## CI/CD Pipeline

GitHub Actions でデプロイを自動化。

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm generate
      - run: npx wrangler pages deploy ...
```

## Build Commands

```bash
# 開発サーバー
nr dev

# 静的サイト生成
nr generate

# プレビュー
npx serve .output/public
```

## Environment

### Required Secrets

| 名前 | 説明 |
|------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン |

## Wrangler Configuration

```toml
# wrangler.toml
name = "blog"
compatibility_date = "2024-09-19"
```

## Post-Deployment

デプロイ後の確認事項:

1. サイトが正常に表示されるか
2. OG 画像が生成されているか
3. sitemap.xml が存在するか
4. robots.txt が正しいか
