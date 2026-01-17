# nuxt-studio バグ修正タスク

## 目的

nuxt-studio の `getCollectionByFilePath` 関数のバグを修正し、ローカルビルドしたパッケージで本番環境での動作を確認する。

## 背景

本番環境で nuxt-studio を使用してコンテンツを編集しようとすると、以下のエラーが発生する：

```
Error: Cannot select item: no corresponding database entry found for fsPath dev-env-2026/index.md
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
- **`cwd`（作業ディレクトリ）を考慮していない**

### 結果

```
fsPath: dev-env-2026/index.md

collections (sorted by prefix length):
  1. docs:    { prefix: '/docs', include: '**/*.md', cwd: 'docs' }
  2. content: { prefix: '/', include: '**/*.{md,yml,json}' }

minimatch('dev-env-2026/index.md', '**/*.md') → true  ← docs にマッチ！（誤り）

→ docs collection として処理される
→ generateIdFromFsPath で誤った ID が生成される
→ クエリで見つからない
→ "no corresponding database entry found" エラー
```

## タスク

### 1. nuxt-studio をフォーク・クローン

```bash
gh repo fork nuxt-content/studio --clone
cd studio
```

### 2. バグを修正

`src/module/runtime/utils/collection.ts` の `getCollectionByFilePath` 関数を修正する。

修正案：

```typescript
export function getCollectionByFilePath(path: string, collections: Record<string, Collection>) {
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
        // cwd が設定されている場合、パスが cwd 配下かどうかを考慮する必要がある
        // ただし、この関数に渡される path は相対パスなので、
        // cwd が設定されている collection は、その cwd からの相対パスでのみマッチすべき

        // 修正: source.cwd が設定されていて、デフォルト（content）以外の場合は、
        // その collection は別のディレクトリのファイルを管理しているので、
        // content ディレクトリからの相対パスではマッチしないようにする
        if (source.cwd && source.cwd !== '' && source.cwd !== 'content') {
          // この source は別のディレクトリ（例: docs）を参照しているので、
          // content ディレクトリ内のファイルパスにはマッチしない
          return false;
        }

        const include = minimatch(p, source.include, { dot: true });
        const exclude = source.exclude?.some((exclude2) => minimatch(p, exclude2));
        return include && !exclude;
      });
      return matchedSource;
    });
  });
  return collection;
}
```

**注意**: 上記は修正案の一つ。実際の修正は、nuxt-studio のアーキテクチャをより深く理解した上で行う必要がある。`cwd` の扱いや、パスの正規化ロジックを確認すること。

### 3. ビルド

```bash
pnpm install
pnpm build
```

### 4. ブログプロジェクトでローカルパッケージを使用

`blog/package.json` を編集：

```json
{
  "dependencies": {
    "nuxt-studio": "file:../studio"
  }
}
```

または pnpm link を使用：

```bash
cd studio
pnpm link --global

cd ../blog
pnpm link --global nuxt-studio
```

### 5. 本番環境で確認

```bash
cd blog
pnpm build
pnpm preview
```

ブラウザで `/_studio` にアクセスし、コンテンツ編集が正常に動作することを確認。

### 6. 確認すべきテストケース

1. `content/dev-env-2026/index.md` を選択 → エラーなく編集できる
2. `docs/nuxt-studio-patch.md` を選択 → エラーなく編集できる
3. 新規ファイル作成 → 正しい collection に保存される

## 関連情報

- GitHub Issue: https://github.com/nuxt-content/studio/issues/235
- 元の docs: `docs/nuxt-studio-patch.md`

## 完了条件

- [ ] バグの修正が完了
- [ ] ローカルビルドが成功
- [ ] 本番環境（preview）でエラーが発生しないことを確認
- [ ] `docs/nuxt-studio-patch.md` を正しい根本原因で更新
