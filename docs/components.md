# Components

コンポーネント設計と命名規則。

## Naming Convention

フォルダ構造でコンポーネント名のプレフィックスを表現する。

### 標準パターン

```
components/
├── Header.vue           → Header
├── Footer.vue           → Footer
└── OgImage/
    └── Default.vue      → OgImageDefault
```

### Nuxt Content Prose

Nuxt Content は `ProseH2`, `ProseH3` などのコンポーネントを探す。
`nuxt.config.ts` で `components.dirs` を設定し、フォルダ構造を維持しつつ正しい名前で登録:

```ts
components: {
  dirs: [
    { path: "~/components/content/prose/heading", prefix: "Prose", pathPrefix: false },
    // ...
  ],
},
```

結果:

```
content/prose/heading/
├── index.vue  → ProseHeading (基底コンポーネント)
├── h2.vue     → ProseH2
├── h3.vue     → ProseH3
└── h4.vue     → ProseH4
```

## Component Categories

### Layout Components

- `Header.vue` - ナビゲーションヘッダー
- `Footer.vue` - フッター
- `BackgroundTexture.vue` - 背景テクスチャ
- `FogOverlay.vue` - 霧エフェクト

### Content Components

- `content/prose/heading/` - 見出しコンポーネント群
  - アンカーリンク機能付き

### OG Image Components

- `OgImage/Default.vue` - デフォルト OG 画像テンプレート

## Component Guidelines

1. **1 コンポーネント 1 責務**
2. **Props は明示的に型定義**
3. **Scoped CSS を使用**
4. **フォルダ構造で関連性を表現**
