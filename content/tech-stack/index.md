---
title: "blog.naito.dev を支える技術スタック"
description: "このブログを支える技術スタックについて。Nuxt 4、Nuxt Content v3、Cloudflare Workers などを採用している。"
date: "2026-01-06"
tags: ["nuxt", "cloudflare"]
---

このブログの技術スタックについて書く。

- Nuxt
  - Nuxt Content
  - Nuxt SEO
  - Nuxt Image
  - Nuxt Fonts
  - Nuxt Icon
  - Nuxt Color Mode
- Cloudflare Workers

## Nuxt エコシステムを選んだ

Nuxt を使いたかったからという理由以外特にない。
個人ブログでは Astro が人気だけど、ぼくの個人ブログについては特に Astro じゃないとダメそうなこともない気がしたので Nuxt を選んだ。

### Nuxt Content

https://content.nuxt.com/

> The git-based CMS for Nuxt.

Zenn の記事も Markdown で書いていたので Markdown を今回も採用。
MDC とかも使ってみたい。

とりあえず Markdown を書けば表示されるのが嬉しい。

元々この Nuxt モジュールが気になっていた。
Nuxt Studio についても気になっている。

https://nuxt.studio/

> Self-hosted CMS for your Nuxt Content website.

東葛.dev の合同誌企画のためにもちょっと触りたい。
このブログにも今後導入予定。

### 今後はタグも活用していきたい

Nuxt Content では frontmatter がサポートされている。\
ここで記事のメタ情報を管理。
まだタグ機能については何もできていないけど、今後は活用していきたい。

## ホスティングには Cloudflare Workers を使用

ドメインを Cloudflare で管理しているという理由だけでホスティングサービスには Cloudflare を選択。\
何かしらのシナジーはあるはずだけど、よくわかってない。

Cloudflare の [yusukebe](https://x.com/yusukebe) さんが

> これからは理由がない限りCloudflare PagesではなくCloudflare Workersを使ってください。

https://x.com/yusukebe/status/1917869496267915641

と言っているので「はい、わかりました」。

ホームページ [naito.dev](https://naito.dev) の方は Vercel でやっているので、この辺をもう少し考えたい。
でも Vercel のことも気になるのでこのままになりそう、特にブログとの連携もないので。

## SEO とかよくわからん、Nuxt SEO ありがとう

- sitemap.xml の自動生成
- robots.txt の管理
- OG 画像の動的生成

この辺をやってくれているらしい。ありがたい。

OG 画像の背景は生成 AI に作成してもらった。\
「血と錆と闇と霧」。

## スタイリングは Pure CSS

CSS フレームワークは使わず、Pure CSS で書いている。\
規模的なものとやっぱりただの CSS が好き。\

Vue の scoped CSS が最近好きすぎる。\
これと CSS のネスト記法のおかげで、スタイリングのためだけのクラスとかを増やさずに済んでいる気がする。\
A11y, HTML semantics の観点ではどうなのか怪しい(ぼくが知識が足りてなくて評価できていないだけ)。

ダークモードは Nuxt Color Mode を使用しているので、これもいい感じにやってくれている。

## 開発体験(と言ってもぼくは何も開発していおらず、Claude Code ｸﾝ が全部作ってくれました)

### Nuxt モジュール

開発体験向上のために以下のモジュールを使用している。

- Nuxt Hints
- Nuxt ESLint
- Nuxt Kit

### 記事と画像を同じディレクトリで管理したかった

Nuxt Kit を使ってカスタムモジュールを作った。\
記事の中には文字(Markdown)と画像が含まれている。\
この 2 つを近くに置きたかった。\j
他に方法があるかもしれないけど Claude Code ｸﾝ のやりたいようにやってもらったところ Nuxt Kit を選定していた。

### Oxc が楽しみ

ブログを作ったことで最新のツールを試してみる遊び場所が増えた。\
なんとなくフォーマッターが少し苦手で、ESLint Stylistic を使用していたので、今回も Stylistic を使用。

と言っても、大したルールは使ってない。\
ダブルクォーテーションとセミコロンくらい。

JS Plugin 対応をやってくれているみたいでとてもありがたい。

ただ、まだ Language Server のサポートが足りていないところがあり、ESLint とペアでやってもらっている。

https://oxc.rs/docs/guide/usage/linter/js-plugins.html#api-support

> Not supported yet:
> * Language server (IDE) support + suggestions (so no in-editor diagnostics or quick-fixes yet).

それぞれの分担みたいなのがよくわかってない。\
規模が小さいプロジェクトなので Oxlint のパワーを享受できているのかもよくわかってない。

### パッケージマネージャー(←これ書く必要ある？)

pnpm を使っている。@antfu/ni を入れているので、`ni` や `nr` コマンドで操作できる。

って Claude Code ｸﾝ が書いてくれた。\
ここまでの内容も全て一度 Claude Code ｸﾝ が書いてくれたものを書き直している。

## 今後の展開

サードパーティスクリプトの管理に Nuxt Scripts を導入したい。\
Nuxt Scripts で何を実現できるかよくわかってないけど。

いいね機能とか閲覧数表示とかしたい。

あとは SNS シェア機能も簡単に作りたい。
