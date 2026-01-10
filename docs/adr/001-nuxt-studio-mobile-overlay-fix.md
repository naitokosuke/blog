# Nuxt Studio モバイル対応のための Overlay 修正

## ステータス

採用

## コンテキスト

Nuxt Studio は画面左下にコンテンツ編集モードを切り替えるフローティングボタンを提供している。しかし、このブログでは以下の問題が発生していた:

1. **デスクトップ**: ボタンがクリックできない場合がある
2. **モバイル**: ボタンがタップに反応しない、または表示されない

原因調査の結果、以下が判明:

- `FogOverlay.vue` と `BackgroundTexture.vue` が `position: fixed` の canvas 要素を使用
- これらの canvas が `nuxt-studio` カスタム要素より上に重なり、タッチイベントをブロック
- `nuxt-studio` は Shadow DOM を使用しているため、外部からの CSS 制御が制限される

## 決定

以下の3つの修正を行う:

### 1. Canvas 要素にタッチイベント無効化を追加

`FogOverlay.vue` と `BackgroundTexture.vue` の canvas に以下の CSS を追加:

```css
canvas {
  pointer-events: none;
  touch-action: none;
  user-select: none;
}
```

**理由**: これらの canvas は視覚効果のみを提供し、ユーザー操作は不要。タッチイベントを完全に無効化することで、下層の要素（nuxt-studio）へのイベント伝播を保証する。

### 2. CSS で nuxt-studio 要素の z-index を設定

`main.css` に以下を追加:

```css
nuxt-studio {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  z-index: 9999 !important;
}
```

**理由**: CSS で nuxt-studio 要素のスタッキングコンテキストを明示的に設定。`!important` は Shadow DOM 外部からのスタイル適用を確実にするため。

### 3. Nuxt Plugin で JavaScript から z-index を設定

`app/plugins/nuxt-studio-fix.client.ts` を作成:

```typescript
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement && node.tagName.toLowerCase() === "nuxt-studio") {
          node.style.position = "fixed";
          node.style.zIndex = "99999";
          node.style.bottom = "0";
          node.style.left = "0";
          observer.disconnect();
          return;
        }
      }
    }
  });

  observer.observe(document.body, { childList: true });

  // 既に存在する場合も対応
  const existing = document.querySelector("nuxt-studio") as HTMLElement | null;
  if (existing) {
    existing.style.position = "fixed";
    existing.style.zIndex = "99999";
    existing.style.bottom = "0";
    existing.style.left = "0";
    observer.disconnect();
  }
});
```

**理由**:
- `nuxt-studio` 要素は動的に DOM に追加されるため、MutationObserver で監視
- CSS のみでは確実に適用されない場合があるため、JavaScript でも設定
- z-index を CSS (9999) より高い値 (99999) に設定し、確実にオーバーレイより上に配置

## 検討した代替案

### 代替案 1: 独自のフローティングボタンを実装

Nuxt Studio が提供するボタンを使わず、独自の `StudioEditButton.vue` を実装する案。

**却下理由**:
- `usePreviewMode` composable は `enabled` (Ref) と `state` のみを提供し、編集モードの切り替えメソッドがない
- Nuxt Studio の認証フローと密結合しており、独自実装では認証状態を適切に管理できない
- 車輪の再発明を避ける

### 代替案 2: FogOverlay の z-index を下げる

`FogOverlay.vue` の z-index を 100 から 1 に下げる案。

**却下理由**:
- 試行した結果、ヘッダーの表示が壊れた
- 他のコンポーネントとの z-index 関係を崩す可能性がある

## 結果

- localhost 環境のモバイルでボタンが表示・操作可能になることを確認
- デプロイ環境では引き続き検証が必要（Nuxt Studio の認証状態に依存する可能性）
- 既存の視覚効果（霧オーバーレイ、背景テクスチャ）に影響なし

## 関連

- Issue: #42
- Branch: `feature/mobile-edit-floating-button`
