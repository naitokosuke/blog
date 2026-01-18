---
title: 開発環境現状確認 2026
date: 2026-01-12T00:00:00.000Z
description: ぼくもやっていく
draft: false
navigation:
  title: 開発環境現状確認 2026
tags: []
---

# 開発環境現状確認 2026

ぼくもやっていく

## エディタ

VS Code です

とはいえ Neovim, helix などに憧れる年頃

Zed を試してみたけど「今じゃなさそうだな」と思った

日本語入力の挙動が怪しかったり

VS Code のサイドバーをカッコつけ目的で右側に配置しているのだが、Zed だとこれが無理だった

VS Code の setttigs.json を import してくれるらしいけどダメだった対応してなさそう

VS Code の使ってない機能が多い気がする(tasks.json や breakpoint を使った debug など)

## コーディングエージェント

Claude Code を趣味でも仕事でも使っている

$100 の方を趣味で使用している

VS Code の拡張機能バージョンを主に使っている

特に不具合というか困ることもない

Ctrl + esc で開くようなショートカットを設定している

右側に出している

## ターミナル

特にこだわりはないんけど、2024 年の年末から Ghostty を使用している

最近 Cmd + d, Opt + Cmd + d でパネル？を分割できることを知った

## ターミナルマルチプレクサ

使ってない(ターミナルマルチプレクサって何？)

## シェル

Zsh をなんとなく使ってた

なんとなくで今度は Nushell を使い始めた

けどすでにちょっと後悔している

POSIX 標準でないために Claude Code が正しく操作できないこともあるらしい

`&&` なんてないよって言われて😇になった

## ランチャー

Raycast 

Ctrl 2 回で開くように hotkey を設定

ランチャーとして以外の機能も重宝している

Rectangle もやめて画面分割も Raycast でやっている

Ghostty の起動を Hotkey 登録している(Opt + Opt)

HyperKey が便利でおすすめだけど Keyball ユーザーなので普通に Ctrl + Shift + Opt +Cmd を実際に押している

ただし MacBook のキーボードを使用することもあってその時は大変

dotfiles で端末ごとの Raycast 設定を管理できるようにして Macbook の方では Hyperkey を登録したい

## Window Manager 

Raycast

## Task Management / Note Taking

タスク管理できてないし苦手

GitHub に草を生やすという不純な動機で TODO リストリポジトリを作成してそこに issue を追加したりしている

カレンダーに登録できるものはカレンダーに登録しているし、TODO リストに載せる手間を考えたらその場ですぐに解消するようにも心がけているのでそんなに issue に追加されることもない

メモは手書きが好きでニーモシネのリングノートを愛用していた

リングノートのリング部分が鬱陶しいのが苦手だったが、90° 横に倒してリング部分を上に持ってくることで解消できてそれ以来ずっと

ただニーモシネシリーズは裏面に罫線が印刷されていないので最近は KOKUYO の同サイズのリングノートを使用している

iPad のフリーボードアプリも大好きでカンファレンスに参加する際はこれで手書きメモをしている

## Web Broweser 

Arc

(Opt +) Cmd + Shift + c で URL コピーできる機能が好き

Space 機能をきちんと使えていない

## Dotfiles

<https://github.com/naitokosuke/dotfiles>

Nix を使うために盆栽し始めた

nix-config って名前から dotfiles に変えてしまったがちょっとモヤモヤしている

Mac を使用しているので nix-darwin を使用している

## PC / Gadgets

### Keyboard

Keyball 61 を愛用している

Keyball ユーザーでも珍しいと思うが左手側にトラックボールを配置している

これは右手で物理メモ帳を取ることが多いので、最低限左手のみでスクロールやクリック操作を行えるようにしたかったから

### Trackpad

やっぱり使いやすいので Keyball 61 と併用している

Scroll Reverser マウスと Trackpad でのスクロール向きを制御している

### PC 

M4 Mac mini の一番安いやつと M1 MacBook Air を使っている

会社からは M4 MacBook Pro のめちゃいいやつを貸してもらっている

こだわりとかじゃなくて一番安いものを使用している

iPhone, iPad, Apple watch, Airpods を使っていて Apple ecosystem ズブズブ人間

### OS

macOS with nix-darwin

NixOS にも挑戦してイキリたい

前々職では Windows を使用していた

Windows の Alt + Tab 機能も好き

### Monitor

セールで買った 27 インチの安いやつを 2 つ横に並べている

ASUS と Xiaomi のやつ

ゲームとかしないから全く問題ない

会社だとワイド系モニターと MacBook 自体のディスプレイを縦に並べて使っている

会社で作業する時間の方が圧倒的に長いのでこっちに慣れてきてしまっている

## Other Tools

Cap っていう画面録画アプリを最近使っている

<https://cap.so/>

無料プランで全く問題ない

綺麗めな画面録画を撮りたい方におすすめ

GIF で保存できたりするのも嬉しい
