# EMR Elite Navigator — ハンドオフ (v2.8.7, 2026-06-02)

新セッションの最初にこのファイル全文を貼り付けて、続きの作業を依頼してください。

## プロジェクト概要

**EMR Elite Navigator** = 日本の救急隊員（消防士・救急救命士）が英語話者の傷病者を診る際に使う、バイリンガル (英/日) の HTML/PWA 単一ファイルアプリ。

- **デプロイ先**: GitHub Pages → https://hidetoshibuya-sketch.github.io/EMR.EliteNavigator/
- **リポジトリ**: https://github.com/hidetoshibuya-sketch/EMR.EliteNavigator
- **ローカル clone**: `~/Documents/EMR.EliteNavigator/`
- **現在のバージョン**: v2.8.7
- **対応端末**: iPhone Safari + Android Chrome (PWA としてホーム画面追加可能)

## 技術スタック

- 単一 HTML + 埋め込み JS/CSS (ビルドステップなし、index.html ~4751 行)
- Web Speech API (SpeechSynthesis + SpeechRecognition)
- 事前録音音声: macOS `say -v Samantha -r 175` で生成、`.m4a` (AAC) 形式、audio/ に約 546 ファイル
- PWA: Service Worker (cache-first for assets, network-first for HTML) + manifest
- jsPDF + html2canvas で 1 ページ Letter PDF 出力（内容量に応じ自動縮小）
- Web Share API で iOS 共有シート連携（メール送信に使用）
- **デザイン: フラット・不透明 (旧 Liquid Glass は v2.8.5 で全廃)。単色背景 #eef2f7、白カード+細枠線、ぼかし(backdrop-filter)なし**

## ファイル構成

**GitHub リポジトリ (フラット構造)**:
```
EMR.EliteNavigator/
├── index.html               # メイン本体 (v2.8.7)
├── sw.js                    # Service Worker (CACHE_VERSION="emr-nav-v2.8-cpr-static-email-9")
├── manifest.json            # PWA manifest
├── icon-192.png, icon-512.png
├── audio/                   # 約546 .m4a ファイル
├── generate_audio.sh        # macOS の `say` で音声生成するスクリプト
├── EMR Elite Navigatorv2.8.html  # スタンドアロン版 (index.html とバイト単位で同一に保つ)
└── README.md
```

**重要**: `index.html` と `EMR Elite Navigatorv2.8.html` は中身を完全一致させて運用している。どちらかを編集したら必ず両方に同じ変更を入れること。

## 変更履歴 (v2.8.2〜v2.8.7)

- **v2.8.2**: CPR フローチャートをトリアージと同じ縦1列スタック型に変更、ステップ間の矢印を削除
- **v2.8.3**: PDF生成エラー修正 (`finalDisposition` スコープ外参照 → `selectedDisposition`)、BUILD REPORTボタンの補足文言削除
- **v2.8.4**: PDFデザイン刷新（細罫線・余白のシンプルな1枚レイアウト）、html2canvas scale 2→1.7
- **v2.8.5**: **Liquid Glass デザイン全廃**（backdrop-filter削除、光沢オーバーレイ除去、背景単色化、半透明白サーフェスを不透明化）
- **v2.8.6**: SSN/電話番号入力欄追加、生年月日→年齢自動計算 (`calcAge`)、バイスタンダー情報セクション新設、FAST→**CPSS**改名、レポート作成者カード新設、PDF を自動縮小で必ずレター1枚に収める方式へ
- **v2.8.7**:
  - **CPR フローチャートを表示専用化**。6ステップを `<button>`+クリック処理から静的 `<div>` に変更。タップで緑になる仕組み（done切替）と「タップで注意事項を表示」パネルを削除。色分け（左ボーダー）は識別用に保持。`.cpr-step` の cursor は default。
  - **BUILD REPORT ボタンを廃止**し、Assessment Activity Log & Handoff Report カード内に「📧 レポートをメールで送信（PDF化して送信）」ボタンを設置。押すと PDF を生成し iOS 共有シート（メール選択可）で送信。共有不可環境では PDF ダウンロードにフォールバック。
  - 注: 関数 `toggleCprStep` と定数 `CPR_STEP_DETAILS` はソース上に残っているが未使用（呼び出し元なし、無害なデッドコード）

## 重要なコード位置 (index.html, v2.8.7)

- 行 411: フラットテーマのコメント（Liquid Glass 撤去マーカー）
- 行 417: `.cpr-flow-grid`（縦スタック）／ `.cpr-step` は表示専用（cursor:default）
- 行 459: タイトル `<h1>EMR Elite Navigator v2.8</h1>`
- 行 765-: CPR フローチャート（静的 `<div class="cpr-step">` ×6、矢印なし、詳細パネルなし）
- 行 828-: `sec-demographics`（患者: Name/DOB→Age自動/SSN/Phone/Unit、続けてバイスタンダー `by-*`）
- 行 849: `info-dob`（生年月日 date input, onchange=calcAge）
- 行 885-: バイスタンダー入力欄
- 行 1286: CPSS 見出し（旧 FAST Scale）
- 行 1670-: `sec-equipment`（使用資機材）
- 行 1675-: `sec-report-author`（作成者 `rep-unit`/`rep-name`）
- 行 1702: 「📧 レポートをメールで送信」ボタン（id=btn-build-report のまま, onclick=buildReport(this)）
- 行 4162: `calcAge()`
- 行 4212-: `buildAutomationReport()`（テキストレポート）
- 行 4539-: `buildStyledReportHtml()`（PDF用HTML。患者ストリップに DOB/SSN/Phone、バイスタンダー欄、フッターに Recorded by）
- 行 4602-: `_renderPDFBlob()`（1枚自動縮小）
- 行 4652-: `buildReport(btn)`（PDF生成→Web Share/メール→失敗時DL）

## デプロイ手順 (Mac で実行)

```bash
cd ~/Documents/EMR.EliteNavigator
git add -A
git commit -m "vX.X: 変更内容を記述"
git push origin main
```

**重要**: コード変更時は `sw.js` の `CACHE_VERSION` 文字列を必ず変える（例: `emr-nav-v2.8-cpr-static-email-9` → `emr-nav-v2.8-XXXX-10`）。これを忘れると古いキャッシュが残る。

## iPhone での更新確認

1. ホーム画面の EMR アイコン長押し → "Appを削除"
2. Safari で https://hidetoshibuya-sketch.github.io/EMR.EliteNavigator/ を開く
3. 新機能が反映されていることを確認
4. 共有 → ホーム画面に追加

## 既知の挙動・制約

- 音声は `.mp3 → .m4a → .wav → .ogg` の順にフォールバック (`playAudio()`)
- **音声ファイル不在時は live TTS (SpeechSynthesis) に fallback**。質問ボタン `ask-name`/`ask-dob`/`ask-ssn`/`ask-phone`/`ask-unit` は事前録音なしで TTS 読み上げ（仕様）。事前録音したい場合は `generate_audio.sh` に追記して再生成
- iOS Speech API のバグ対策: 90 文字チャンク、global anti-GC array、pause/resume keep-alive
- PWA キャッシュ更新は `sw.js` の `CACHE_VERSION` 文字列依存
- CPR の日本語コーチング音声は v2.8 で完全削除。CPRチャートは表示専用で音声なし
- triage 音声 (`triage-*.m4a`) はファイル残るが呼び出されない
- レポートのメール送信は Web Share API 依存。iOS/対応Android は共有シート→メール、非対応環境（PC等）は PDF ダウンロードにフォールバック
- **SSN はマスクせず画面・PDFともそのまま表示**

## 残課題・改善候補 (ユーザー指示次第)

- 単独 (Single) 患者でも triage タグ番号入力できる選択肢
- PDF にバイタル経時グラフ追加
- 多言語拡張 (中国語/韓国語/スペイン語など)
- ask-* 質問音声の事前録音化
- SSN マスク表示オプション
- 未使用コード (`toggleCprStep` / `CPR_STEP_DETAILS`) の削除

## 連絡情報

- ユーザー: HIDETO (hideto.shibuya@gmail.com)
- GitHub username: hidetoshibuya-sketch
- git identity: user.name "Hideto Shibuya" / user.email "hideto.shibuya@gmail.com" (設定済み)
- 認証: PAT を Keychain に保存済み (`git push` 時にプロンプト出ない)

---

**新セッションへの指示テンプレート**:

> 上記ハンドオフを読んで現状を把握してください。
> 次に [やりたいこと] を実装してください。
> 完了したら deploy 手順も教えてください。
