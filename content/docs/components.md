# Components

コンポーネント設計と命名規則。

## Naming Convention

フォルダ構造でコンポーネント名のプレフィックスを表現する。

### 標準パターン

```
components/
├── Header.vue           → Header
├── Footer.vue           → Footer
├── ThemeToggle.vue      → ThemeToggle
├── Hero.vue             → Hero
├── ShareButtons.vue     → ShareButtons
├── BackgroundTexture.vue
├── FogOverlay.vue
└── OgImage.vue          → OgImage (OG 画像生成用)
```

### Nuxt Content Prose

Nuxt Content は `ProseH2`, `ProseH3` などのコンポーネントを探す。
`nuxt.config.ts` で `components.dirs` を設定し、フォルダ構造を維持しつつ正しい名前で登録:

```ts
components: {
  dirs: [
    { path: "~/components/content/prose/heading", prefix: "Prose", pathPrefix: false },
    { path: "~/components/content/prose", prefix: "Prose", pathPrefix: false },
    // ...
  ],
},
```

結果:

```
content/prose/
├── heading/
│   ├── index.vue  → ProseHeading (基底コンポーネント)
│   ├── h2.vue     → ProseH2
│   ├── h3.vue     → ProseH3
│   └── h4.vue     → ProseH4
└── ProseImg.vue   → ProseImg
```

## Component Categories

### Layout Components

- `Header.vue` - ナビゲーションヘッダー（ロゴ、GitHub リンク、テーマ切替、オーバーレイ切替）
- `Footer.vue` - フッター（コピーライト表示）
- `BackgroundTexture.vue` - 背景テクスチャ（ダークモード用）
- `FogOverlay.vue` - 霧エフェクト（ライトモード用）

### UI Components

- `ThemeToggle.vue` - ライト/ダークモード切替（「表」「裏」表示）
- `Hero.vue` - 記事のヒーロー画像（タイトル、シェアボタン付き）
- `ShareButtons.vue` - SNS シェアボタン（X、URL コピー）

### Content Components

- `content/prose/heading/` - 見出しコンポーネント群（アンカーリンク機能付き）
- `content/prose/ProseImg.vue` - 画像コンポーネント（NuxtImg でラップ）

### OG Image Components

- `OgImage.vue` - OG 画像テンプレート（Zen Old Mincho フォント使用）

## Composables

### useOverlay

霧とテクスチャの状態管理。

```ts
const { fogEnabled, toggleFog, textureEnabled, toggleTexture } = useOverlay();
```

- `fogEnabled` - 霧の表示状態（ライトモード用）
- `textureEnabled` - テクスチャの表示状態（ダークモード用）
- アニメーション付きトグル（800ms、easeOutCubic）

## Component Guidelines

1. **1 コンポーネント 1 責務**
2. **Props は明示的に型定義**
3. **Scoped CSS を使用**
4. **フォルダ構造で関連性を表現**
