# Typography

本ブログのタイポグラフィ設計。可読性と視覚的階層を両立する。

---

## 設計原則

1. **見出しは必ず本文より大きくする** — 視覚的階層の明確化
2. **本文サイズを基準にスケールを構築** — 本文の可読性を最優先
3. **PC/モバイルで適切なサイズを維持** — デバイスに応じた最適化

---

## フォントサイズスケール

### PC（768px超）

| 要素 | rem | px（参考） | 本文比 |
|------|-----|-----------|--------|
| body | 1.375 | 22px | 1.0x |
| h1 | 2.5 | 40px | 1.82x |
| h2 | 2 | 32px | 1.45x |
| h3 | 1.75 | 28px | 1.27x |
| h4 | 1.5 | 24px | 1.09x |

### モバイル（768px以下）

| 要素 | rem | px（参考） | 本文比 |
|------|-----|-----------|--------|
| body | 1.125 | 18px | 1.0x |
| h1 | 1.75 | 28px | 1.56x |
| h2 | 1.5 | 24px | 1.33x |
| h3 | 1.375 | 22px | 1.22x |
| h4 | 1.25 | 20px | 1.11x |

---

## 見出しスタイル

```css
:is(h1, h2, h3, h4) {
  font-weight: 700;
  line-height: 1.3;
  margin-block: 2rem 0.75rem;
  letter-spacing: 0.05em;
}
```

- **font-weight: 700** — 太字で本文との差別化
- **line-height: 1.3** — 見出しは詰め気味に
- **margin-block** — 上に余白を多く、下は控えめ
- **letter-spacing: 0.05em** — わずかに字間を空け、見出し感を強調

---

## 本文スタイル

```css
html {
  line-height: 1.8;
}
```

- **line-height: 1.8** — 日本語の長文読書に適した行間

---

## レスポンシブ設計

モバイルでは本文を小さくしつつ、見出しとの比率を維持する。

- PC: 本文 22px を基準に見出しを拡大
- モバイル: 本文 18px を基準に見出しを拡大

どちらの環境でも**すべての見出しが本文より大きい**ことを保証する。

---

## その他の要素

### インラインコード

```css
code {
  font-size: 0.875em;
  border: 1px solid var(--color-border);
}
```

- 本文の 87.5% サイズ
- ボーダーで視覚的に区別

### テーブル（モバイル）

```css
@media (width <= 768px) {
  table {
    font-size: 0.875rem;
  }
  :is(th, td) {
    padding: 0.5rem;
  }
}
```

- モバイルではテーブルを小さめに
- パディングも縮小して収まりを良くする

---

## フォント

```css
:root {
  --font-sans: "Zen Old Mincho", ui-serif, serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}
```

- **本文**: Zen Old Mincho（@nuxt/fonts で管理）
- **コード**: システムモノスペースフォント

---

## 参照

- [app/assets/css/main.css](../app/assets/css/main.css) — 実装
