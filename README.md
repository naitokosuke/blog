# Nuxt Content Blog (SSG)

Nuxt Content を使った **個人ブログ**です。  
Nuxt の **SSG(静的生成)のみ**を使用し、静的ホスティング(Cloudflare Pages / Netlify / Vercel 等)にそのまま配置できる構成になっています。

- 記事は Markdown で管理
- Git ベースの運用
- 将来的に Nuxt Studio を追加

---

## 技術スタック

- **Nuxt**(SSG / Static Generation)
- **@nuxt/content**

### init 時点で導入済みの Nuxt 公式モジュール

> ※ このプロジェクトでは、以下モジュールは **init 時にすでに install 済み**です  
> 追加 install は行っていません。

- `@nuxt/content`  
  Markdown ベースのコンテンツ管理
- `@nuxt/eslint`  
  ESLint 統合
- `@nuxt/fonts`  
  Web フォント管理
- `@nuxt/hints`  
  パフォーマンス / ベストプラクティス警告
- `@nuxt/icon`  
  アイコンコンポーネント
- `@nuxt/image`  
  画像最適化(`<NuxtImg>`)
- `@nuxt/scripts`  
  外部スクリプト管理(将来拡張用)

---

## 開発環境

### 依存関係のインストール

```bash
pnpm install
