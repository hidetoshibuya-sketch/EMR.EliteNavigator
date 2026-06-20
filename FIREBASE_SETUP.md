# Firebase 移行セットアップ手順 / Firebase Setup

EMR Elite Navigator を **Firebase Hosting + Firestore + Authentication（ログイン）** で運用するための手順です。
アプリ側のコードは実装済みです。あとは下記を一度設定すれば動きます。
（未設定でもアプリは動きます。その場合は年間データは「端末内のみ保存」にフォールバックします。）

---

## 1. Firebase プロジェクトを作成
1. https://console.firebase.google.com/ を開く（Googleアカウントが必要）
2. 「プロジェクトを追加」→ 名前を入力（例: `emr-elite-navigator`）→ 作成

## 2. Web アプリを登録して config を取得
1. プロジェクト概要の **`</>`（ウェブ）** アイコンをクリック
2. アプリのニックネームを入力 →「アプリを登録」
3. 表示される `firebaseConfig`（apiKey, authDomain, projectId …）をコピー
4. `index.html` 内の `const firebaseConfig = { ... }`（`PASTE_...` の箇所）を、コピーした値で**置き換える**

## 3. ログイン（Authentication）= 共有パスワード方式
アプリは「URLを知っている人が、共有パスワードを入力して開く」方式です。
裏で**1つの共有アカウント**を使い、画面では**パスワードだけ**入力します（メールは固定でコードに埋め込み済み）。

1. 左メニュー **セキュリティ > Authentication** →「始める」
2. **Sign-in method** タブ → **メール / パスワード** を有効化して保存
3. **Users** タブ →「ユーザーを追加」で、共有アカウントを1つ作成:
   - メール: `crew@emergency-protocols.web.app` （★この通り正確に。アプリ内の固定値と一致させる）
   - パスワード: チームで使う合言葉（これを利用者に共有）
4. パスワードを変えたいときは、このユーザーのパスワードを変更すればOK。

※ 緊急ツールのため、ゲート画面には「オフラインで続行」リンクがあり、
　ネット未接続でも端末内保存で使えます（クラウド共有はパスワード接続時のみ）。
　一度パスワードで接続した端末は、以後オフラインでもログイン状態が保持されます。

## 4. Firestore データベースを作成
1. 左メニュー **Build > Firestore Database** →「データベースを作成」
2. 本番モードで作成（ロケーションは `asia-northeast1`（東京）推奨）
3. セキュリティルールはこのリポジトリの `firestore.rules` を使います（手順6で反映）

## 5. Firebase CLI を準備
```bash
npm install -g firebase-tools
firebase login
```
`.firebaserc` の `YOUR_FIREBASE_PROJECT_ID` を実際のプロジェクトIDに書き換える
（または `firebase use --add` で対話的に選択）。

## 6. デプロイ
リポジトリのフォルダで：
```bash
cd "/Users/shibuyahideto/pCloud Drive/Code/Projects/EMR.EliteNavigator"

# Firestore のルールを反映
firebase deploy --only firestore:rules

# アプリ（Hosting）を公開
firebase deploy --only hosting
```
公開URL: `https://YOUR_FIREBASE_PROJECT_ID.web.app`

---

## データの仕組み
- ログインすると、年間レスポンスデータは Firestore の **`annualRecords`** コレクションに保存され、
  **複数端末・複数基地で共有**されます（オフライン時はキャッシュに溜まり、オンライン復帰で自動同期）。
- 未ログイン時は従来どおり端末内（localStorage）に保存。
- 「Export（CSV）」はログイン/未ログインどちらでも、表示中のデータを書き出します。

## セキュリティ / 注意
- `firestore.rules` で「ログイン済みユーザーのみ読み書き可」に制限しています。
- 年間データは年齢・性別・主訴など匿名化された内容です。氏名・SSN等の個人情報はクラウドに保存していません。
- `firebaseConfig` の値は公開されても問題ない種類（クライアント識別子）ですが、アクセス制御は必ず上記ルールで行ってください。

## GitHub Pages との併用
- Firebase Hosting に移行後も GitHub Pages はそのまま残せます（両方で公開可）。
- どちらか一方に統一したい場合は、案内します。
