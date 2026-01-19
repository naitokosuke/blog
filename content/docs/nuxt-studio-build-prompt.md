# nuxt-studio ビルド済みパッケージのプッシュ

## 目的

`fix/get-collection-by-file-path` ブランチでビルド済みの `dist` ディレクトリをコミット・プッシュし、GitHub から直接インストールできるようにする。

## 背景

pnpm で GitHub リポジトリから直接インストールする場合、`prepack` スクリプトが実行される。しかし nuxt-studio のビルドには `.nuxt` ディレクトリが必要で、クリーンな状態からはビルドできない。

そのため、事前にビルドした `dist` ディレクトリをコミットしてプッシュする必要がある。

## タスク

### 1. nuxt-studio ディレクトリに移動

```bash
cd /Users/naitokosuke/src/github.com/naitokosuke/nuxt-studio
```

### 2. 依存関係をインストール

```bash
pnpm install
```

### 3. module をビルド

```bash
cd src/module
pnpm run dev:prepare  # .nuxt ディレクトリを生成
pnpm run build        # dist を生成
```

または、ルートから：

```bash
pnpm run build
```

### 4. .gitignore を確認・修正

`dist` ディレクトリが `.gitignore` に含まれている場合、一時的に除外するか、force add する。

```bash
git add -f src/module/dist/
```

### 5. prepack スクリプトを無効化

`package.json` の `scripts.prepack` を削除またはコメントアウト。これにより、インストール時にビルドが実行されなくなる。

```json
{
  "scripts": {
    // "prepack": "nuxt-module-build build src/module; vite build src/app"
  }
}
```

### 6. コミット・プッシュ

```bash
git add .
git commit -m "build: add pre-built dist for direct GitHub installation"
git push origin fix/get-collection-by-file-path
```

### 7. blog プロジェクトで確認

```bash
cd /Users/naitokosuke/src/github.com/naitokosuke/blog
rm -rf node_modules/.pnpm/nuxt-studio*
pnpm install
pnpm build
```

## 注意事項

- `dist` をコミットするのは通常は推奨されないが、GitHub から直接インストールする場合は必要
- 将来的には npm にパブリッシュするか、本家に PR を出すのが望ましい

## 完了条件

- [ ] `dist` ディレクトリがビルドされている
- [ ] `prepack` スクリプトが無効化されている
- [ ] `dist` がコミット・プッシュされている
- [ ] blog プロジェクトで `pnpm install` が成功する
