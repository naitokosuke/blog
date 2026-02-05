# nuxt-studio バグ修正タスク（修正版）

## 目的

nuxt-studio の `getCollectionByFilePath` 関数のバグを修正し、ローカルビルドしたパッケージで本番環境での動作を確認する。

## 背景

本番環境で nuxt-studio を使用してコンテンツを編集しようとすると、以下のエラーが発生する：

```
Error: Collection not found for fsPath: dev-env-2026/index.md
```

## 根本原因

`nuxt-studio/dist/module/runtime/utils/collection.js` の `getCollectionByFilePath` 関数にバグがある。

### 問題のコード

```javascript
export function getCollectionByFilePath(path, collections) {
  let matchedSource;
  const sortedCollections = Object.values(collections).sort((a, b) => {
    return (b.source[0]?.prefix?.length || 0) - (a.source[0]?.prefix?.length || 0);
  });
  const collection = sortedCollections.find((collection2) => {
    if (!collection2.source || collection2.source.length === 0) {
      return;
    }
    const paths = path === "/" ? ["index.yml", "index.yaml", "index.md", "index.json"] : [path];
    return paths.some((p) => {
      matchedSource = collection2.source.find((source) => {
        const include = minimatch(p, source.include, { dot: true });  // ← ここが問題
        const exclude = source.exclude?.some((exclude2) => minimatch(p, exclude2));
        return include && !exclude;
      });
      return matchedSource;
    });
  });
  return collection;
}
```

### バグの内容

- `minimatch` はファイルパスと `include` パターンのみを比較している
- **異なる `cwd` を持つ collection を区別していない**

### 結果

```
fsPath: dev-env-2026/index.md

collections (sorted by prefix length):
  1. docs:    { prefix: '/docs', include: '**/*.md' }
  2. content: { prefix: '/', include: '**/*.{md,yml,json}' }

minimatch('dev-env-2026/index.md', '**/*.md') → true  ← docs にマッチ！（誤り）

→ docs collection として処理される
→ generateIdFromFsPath で誤った ID が生成される
→ クエリで見つからない
→ エラー
```

## 重要な発見

`@nuxt/content` の `defineLocalSource` 関数を確認したところ：

```javascript
const resolvedSource = {
  _resolved: true,
  prefix: withoutTrailingSlash(withLeadingSlash(fixed)),
  // ...
  ...source,
  include: source.include,
  cwd: ""  // ← 最後に空文字列で上書きされる！
};
```

**`source.cwd` は常に空文字列 `""` になる！** これは `@nuxt/content` 側の実装。

そのため、`source.cwd` で判定するアプローチは機能しない。

## 正しい修正アプローチ

`source.cwd` ではなく、**`source.prefix`** を使って判定する必要がある。

- `content` collection: `prefix: "/"`
- `docs` collection: `prefix: "/docs"`

`fsPath` が `dev-env-2026/index.md` の場合、これは `content` ディレクトリからの相対パス。
`docs` collection は `prefix: "/docs"` を持っているので、`/dev-env-2026/index.md` は `/docs` で始まらない → マッチしない。

### 修正案

```typescript
export function getCollectionByFilePath(path: string, collections: Record<string, CollectionInfo>): CollectionInfo | undefined {
  let matchedSource: ResolvedCollectionSource | undefined
  const sortedCollections = Object.values(collections).sort((a, b) => {
    return (b.source[0]?.prefix?.length || 0) - (a.source[0]?.prefix?.length || 0)
  })
  const collection = sortedCollections.find((collection) => {
    if (!collection.source || collection.source.length === 0) {
      return
    }

    const paths = path === '/' ? ['index.yml', 'index.yaml', 'index.md', 'index.json'] : [path]
    return paths.some((p) => {
      matchedSource = collection.source.find((source) => {
        // prefix が "/" 以外の場合（例: "/docs"）、
        // そのソースは別のディレクトリのファイルを管理している。
        // content ディレクトリからの相対パス（fsPath）は
        // そのような collection にはマッチしないようにする。
        const prefix = source.prefix || '/'
        if (prefix !== '/') {
          // この source は content 以外のディレクトリを参照している
          // fsPath は content からの相対パスなのでマッチしない
          return false
        }

        const include = minimatch(p, source.include, { dot: true })
        const exclude = source.exclude?.some(exclude => minimatch(p, exclude))

        return include && !exclude
      })

      return matchedSource
    })
  })

  return collection
}
```

## タスク

### 1. 修正を適用

`/Users/naitokosuke/src/github.com/naitokosuke/nuxt-studio/src/module/src/runtime/utils/collection.ts` を上記の修正案で更新する。

### 2. ビルド

```bash
cd /Users/naitokosuke/src/github.com/naitokosuke/nuxt-studio
pnpm install
pnpm run build
```

### 3. dist をコミット・プッシュ

```bash
git add -f dist/
git add src/module/src/runtime/utils/collection.ts
git commit -m "fix: use prefix instead of cwd in getCollectionByFilePath"
git push origin fix/get-collection-by-file-path
```

### 4. blog プロジェクトで確認

```bash
cd /Users/naitokosuke/src/github.com/naitokosuke/blog
rm -rf node_modules/.pnpm/nuxt-studio*
pnpm install
pnpm build
pnpm preview
```

## 完了条件

- [ ] `prefix` ベースの修正が適用されている
- [ ] ビルドが成功する
- [ ] `content/dev-env-2026/index.md` を選択してもエラーが出ない
- [ ] `docs/` 配下のファイルも正常に動作する
