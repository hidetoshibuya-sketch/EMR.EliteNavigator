# EMR Elite Navigator — ハンドオフ (v2.8.6, 2026-06-02)

新セッションの最初にこのファイル全文を貼り付けて、続きの作業を依頼してください。

## プロジェクト概要

**EMR Elite Navigator** = 日本の救急隊員（消防士・救急救命士）が英語話者の傷病者を診る際に使う、バイリンガル (英/日) の HTML/PWA 単一ファイルアプリ。

- **デプロイ先**: GitHub Pages → https://hidetoshibuya-sketch.github.io/EMR.EliteNavigator/
- **リポジトリ**: https://github.com/hidetoshibuya-sketch/EMR.EliteNavigator
- **ローカル clone**: `~/Documents/EMR.EliteNavigator/`
- **現在のバージョン**: v2.8.6 (push 済み, commit ec61cd2)
- **対応端末**: iPhone Safari + Android Chrome (PWA としてホーム画面追加可能)

## 技術スタック

- 単一 HTML + 埋め込み JS/CSS (ビルドステップなし、index.html ~4757 行)
- Web Speech API (SpeechSynthesis + SpeechRecognition)
- 事前録音音声: macOS `say -v Samantha -r 175` で生成、`.m4a` (AAC) 形式、audio/ に 546 ファイル
- PWA: Service Worker (cache-first for assets, network-first for HTML) + manifest
- jsPDF + html2canvas で 1 ページ Letter PDF 出力
- Web Share API で iOS 共有シート連携
- **デザイン: フラット・不透明 (旧 Liquid Glass は v2.8.5 で全廃)。単色背景 #eef2f7、白カード+細枠線、ぼかし(backdrop-filter)なし**

## ファイル構成

**GitHub リポジトリ (フラット構造)**:
```
EMR.EliteNavigator/
├── index.html               # メイン本体 (v2.8.6)
├── sw.js                    # Service Worker (CACHE_VERSION="emr-nav-v2.8-fields-cpss-author-8")
├── manifest.json            # PWA manifest
├── icon-192.png, icon-512.png
├── audio/                   # 546 .m4a ファイル
├── generate_audio.sh        # macOS の `say` で音声生成するスクリプト
├── EMR Elite Navigatorv2.8.html  # スタンドアロン版 (index.html とバイト単位で同一に保つ)
└── README.md
```

**重要**: `index.html` と `EMR Elite Navigatorv2.8.html` は中身を完全一致させて運用している。どちらかを編集したら必ず両方に同じ変更を入れること。

## v2.8.2〜v2.8.6 で実施した変更

- **v2.8.2**: CPR フローチャートをトリアージと同じ縦1列スタック型に変更（PCでの崩れ修正）、ステップ間の矢印を削除 (`.cpr-arrow { display:none }`)
- **v2.8.3**: PDF生成エラー修正 (`finalDisposition` がスコープ外参照 → `selectedDisposition` を直接使用)、BUILD REPORTボタンの補足文言 `(レポート生成 → PDF ダウンロード)` を削除
- **v2.8.4**: PDFデザインを刷新（色付きボックス廃止→細罫線・余白・大文字小ラベルのシンプルな1枚レイアウト）、html2canvas の scale を 2→1.7 に
- **v2.8.5**: **Liquid Glass デザインを全廃**。backdrop-filter を全削除、body::before / .card::before の光沢オーバーレイ除去、背景を単色化、半透明白サーフェスを不透明化、:root トークンを solid 値に
- **v2.8.6**:
  - 個人情報に **SSN** (`info-ssn`)・**電話番号** (`info-phone`) 入力欄を追加
  - 年齢は **生年月日 (`info-dob`, type=date) から自動計算** → `info-age` (readonly) に表示。関数 `calcAge(dobId, ageId)`
  - **バイスタンダー情報**セクション新設 (`by-name`/`by-dob`/`by-age`/`by-ssn`/`by-phone`)、関数 `saveBystander()`
  - 脳卒中評価のタイトルを **FAST Scale → CPSS** に改名（UI・レポート両方。内部変数 `fastScaleResults` は維持）
  - Equipment セクションの直後に **レポート作成者**カード新設 (`rep-unit`/`rep-name`)、関数 `saveReportAuthor()`
  - PDFを **内容量に応じて自動縮小し必ずレター1枚に収める方式**に変更（`.sheet` を固定高さ+overflow:hidden → `min-height:1056px`、`_renderPDFBlob` で実高さを取得して html2canvas に渡し、addImage が比率フィットで縮小）

## 重要なコード位置 (index.html, v2.8.6)

- 行 411: フラットテーマのコメント（Liquid Glass 撤去マーカー）
- 行 459: タイトル `<h1>EMR Elite Navigator v2.8</h1>`
- 行 834-: `sec-demographics`（患者個人情報。Name/DOB→Age自動/SSN/Phone/Unit、続けてバイスタンダー）
- 行 855: `info-dob` (生年月日 date input, onchange=calcAge)
- 行 867: `info-ssn` / 直後に `info-phone`
- 行 891-: バイスタンダー入力欄 (`by-*`)
- 行 1292: CPSS 見出し（旧 FAST Scale）
- 行 1676-: `sec-equipment`（使用資機材）
- 行 1681-: `sec-report-author`（レポート作成者 `rep-unit`/`rep-name`）
- 行 1708: BUILD REPORT ボタン
- 行 3582-: `CPR_STEP_DETAILS` + 行 3591 `toggleCprStep()`
- 行 3426: `lockTriageNode()`
- 行 4168: `calcAge()` / 行 4185 `saveBystander()` / 行 4190 `saveReportAuthor()`
- 行 4218-: `buildAutomationReport()`（テキストレポート。患者+バイスタンダー+CPSS+作成者を出力）
- 行 4545-: `buildStyledReportHtml()`（PDF用HTML。患者ストリップに DOB/SSN/Phone、バイスタンダー欄、フッターに Recorded by）
- 行 4608-: `_renderPDFBlob()`（1枚自動縮小ロジック）
- 行 4658-: `buildReport(btn)`（統合エントリ：データ生成→PDF→Web Share→失敗時DL）

## デプロイ手順 (Mac で実行)

ローカル clone を直接編集しているので、そのまま：
```bash
cd ~/Documents/EMR.EliteNavigator
git add -A
git commit -m "vX.X: 変更内容を記述"
git push origin main
```

**重要**: コード変更時は `sw.js` の `CACHE_VERSION` 文字列を必ず変える（例: `emr-nav-v2.8-fields-cpss-author-8` → `emr-nav-v2.8-XXXX-9`）。これを忘れると古いキャッシュが残る。

## iPhone での更新確認

1. ホーム画面の EMR アイコン長押し → "Appを削除"
2. Safari で https://hidetoshibuya-sketch.github.io/EMR.EliteNavigator/ を開く
3. タイトル/新機能が反映されていることを確認
4. 共有 → ホーム画面に追加

## 既知の挙動・制約

- 音声は `.mp3 → .m4a → .wav → .ogg` の順にフォールバック (`playAudio()`)
- **音声ファイル不在時は live TTS (SpeechSynthesis) に fallback**。質問ボタンの `ask-name`/`ask-age`/`ask-dob`/`ask-ssn`/`ask-phone`/`ask-unit` は事前録音されておらず TTS で読み上げる（仕様）。事前録音したい場合は `generate_audio.sh` に `generate "ask-xxx" "英文"` を追記して再生成
- iOS Speech API のバグ対策: 90 文字チャンク、global anti-GC array、pause/resume keep-alive
- PWA キャッシュ更新は `sw.js` の `CACHE_VERSION` 文字列依存
- CPR の日本語コーチング音声は v2.8 で完全削除（視覚フローチャートに置換）。CPRチャートに音声は紐づかない
- triage 音声 (`triage-*.m4a`) はファイル残るが呼び出されない (Multi 全表示モード)
- **SSN はマスクせず画面・PDFともそのまま表示**（下4桁のみ表示等にしたい場合は要変更）

## 残課題・改善候補 (ユーザー指示次第)

- 単独 (Single) 患者でも triage タグ番号入力できる選択肢
- CPR フローチャートのステップ完了タイマー連動
- PDF にバイタル経時グラフ追加
- 多言語拡張 (中国語/韓国語/スペイン語など)
- ask-* 質問音声の事前録音化
- SSN マスク表示オプション

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
