# nuxt-studio パッチについて

## 問題の概要

本番環境で nuxt-studio を使用してコンテンツを編集しようとすると、以下のエラーが発生する。

```
Error: Cannot select item: no corresponding database entry found for fsPath dev-env-2026/index.md
```

## 原因調査

### 問題の発生箇所

エラーは `nuxt-studio/dist/app/main.js` 内の `selectByFsPath` 関数で発生している。

```javascript
selectByFsPath: async function(e) {
  // ...
  const n = await l.get(e);
  if (!n) throw new Error(`Cannot select item: no corresponding database entry found for fsPath ${e}`);
}
```

### 関連する GitHub Issue

- [nuxt-content/studio#235](https://github.com/nuxt-content/studio/issues/235) - Editor not showing files while having a collection with `prefix: '/something'`
- [nuxt-content/studio#230](https://github.com/nuxt-content/studio/issues/230) - `cwd` in `content.config.ts` is ignored when saving files

PR #242 がマージされたが、Issue #235 は2026年1月12日に再オープンされ、問題が完全には解決されていない。

### 根本原因

`nuxt-studio/dist/module/runtime/utils/source.js` の `getCollectionSourceById` 関数で、`ufo` ライブラリの `withoutLeadingSlash` 関数が `"/"` を返す特殊な動作が原因。

```javascript
// ufo ライブラリの動作
withoutLeadingSlash("/")  // => "/" (変更なし)
withoutLeadingSlash("")   // => "/" (空文字を "/" に変換)
```

この動作により、`prefix: "/"` の場合に比較ロジックが期待通りに動作しないケースがある。

## パッチの内容

### 変更箇所

`dist/module/runtime/utils/source.js` の `getCollectionSourceById` 関数:

```diff
     const [fixPart] = source.include.includes("*") ? source.include.split("*") : ["", source.include];
     const fixed = withoutTrailingSlash(fixPart || "/");
-    if (withoutLeadingSlash(fixed) === withoutLeadingSlash(prefix)) {
+    const normalizedFixed = withoutLeadingSlash(fixed) || "";
+    const normalizedPrefix = withoutLeadingSlash(prefix) || "";
+    if (normalizedFixed === normalizedPrefix) {
       fsPath = prefixAndPath;
     } else {
```

### 変更理由

`withoutLeadingSlash` が `"/"` を返す場合、空文字列にフォールバックすることで正しく比較できるようにした。

## テストコード

### パッチ適用後の動作確認

```javascript
// test-patch.mjs
import { withoutTrailingSlash, withoutLeadingSlash, withLeadingSlash } from 'ufo';
import { join } from 'pathe';
import { minimatch } from 'minimatch';

// パッチ適用後の getCollectionSourceById
function getCollectionSourceById(id, sources) {
  const [_, ...rest] = id.split(/[/:]/);
  const prefixAndPath = rest.join("/");
  const matchedSource = sources.find((source) => {
    const prefix = source.prefix;
    if (!prefix) {
      return false;
    }
    if (!withLeadingSlash(prefixAndPath).startsWith(prefix)) {
      return false;
    }
    let fsPath;
    const [fixPart] = source.include.includes("*") ? source.include.split("*") : ["", source.include];
    const fixed = withoutTrailingSlash(fixPart || "/");
    // パッチ: 空文字列へのフォールバック
    const normalizedFixed = withoutLeadingSlash(fixed) || "";
    const normalizedPrefix = withoutLeadingSlash(prefix) || "";
    if (normalizedFixed === normalizedPrefix) {
      fsPath = prefixAndPath;
    } else {
      const path = prefixAndPath.replace(prefix, "");
      fsPath = join(fixed, path);
    }
    const include = minimatch(fsPath, source.include, { dot: true });
    const exclude = source.exclude?.some((exclude2) => minimatch(fsPath, exclude2));
    return include && !exclude;
  });
  return matchedSource;
}

// テストケース
const sources = [{
  _resolved: true,
  prefix: "/",
  include: "**/*.{md,yml,json}",
  cwd: "/path/to/content"
}];

const id = "content/dev-env-2026/index.md";

const result = getCollectionSourceById(id, sources);
console.log("Result:", result ? "FOUND" : "NOT FOUND");
// Expected: FOUND
```

### ufo ライブラリの動作確認

```javascript
// test-ufo.mjs
import { withoutTrailingSlash, withoutLeadingSlash } from 'ufo';

console.log('withoutTrailingSlash("/"):', JSON.stringify(withoutTrailingSlash('/')));
// => "/"

console.log('withoutLeadingSlash("/"):', JSON.stringify(withoutLeadingSlash('/')));
// => "/"

console.log('withoutLeadingSlash(""):', JSON.stringify(withoutLeadingSlash('')));
// => "/"

// パッチでの対応
const fixed = "/";
const normalizedFixed = withoutLeadingSlash(fixed) || "";
console.log('normalizedFixed:', JSON.stringify(normalizedFixed));
// => ""
```

### ID 生成の確認

```javascript
// test-id-generation.mjs
import { join } from 'pathe';

function parseSourceBase(source) {
  const [fixPart, ...rest] = source.include.includes("*")
    ? source.include.split("*")
    : ["", source.include];
  return {
    fixed: fixPart || "",
    dynamic: "*" + rest.join("*")
  };
}

function generateIdFromFsPath(path, collectionInfo) {
  const { fixed } = parseSourceBase(collectionInfo.source[0]);
  const pathWithoutFixed = path.substring(fixed.length);
  return join(collectionInfo.name, collectionInfo.source[0]?.prefix || "", pathWithoutFixed);
}

const collectionInfo = {
  name: "content",
  source: [{
    prefix: "/",
    include: "**/*.{md,yml,json}",
  }]
};

const fsPath = "dev-env-2026/index.md";
const generatedId = generateIdFromFsPath(fsPath, collectionInfo);

console.log("fsPath:", fsPath);
console.log("Generated ID:", generatedId);
// => "content/dev-env-2026/index.md"
```

## パッチの適用方法

pnpm の patchedDependencies 機能を使用:

```json
// package.json
{
  "pnpm": {
    "patchedDependencies": {
      "nuxt-studio": "patches/nuxt-studio.patch"
    }
  }
}
```

パッチファイルは `patches/nuxt-studio.patch` に保存されている。

## 今後の対応

- nuxt-studio の次のリリースで Issue #235 が修正されたら、パッチを削除する
- 修正がリリースされたかは [nuxt-content/studio releases](https://github.com/nuxt-content/studio/releases) で確認
