Football Career Hub — 青・水色のWebサイト版（公開前の準備ファイル）
======================================================

このフォルダーは、GitHub Pages等の無料静的ホスティングで公開できるWebサイト本体です。
サイト本体は作成済みですが、現時点でインターネット公開や本番Firebase接続はまだ完了していません。

■ 目標
・固定URLひとつで、iPhone/PC/タブレットから閲覧
・閲覧はログイン不要
・管理者のみメール＋パスワードでログインして追加・編集
・選手、試合、成績、SNS、戦術、スカウトなどをクラウドで共有
・青、水色、白の明るいデザイン
・iPhoneホーム画面追加にも対応するPWA

■ 現状
・デザインと主要機能のWebコードは作成済み
・無料クラウドFirestore用の公開読み取り／管理者のみ書き込みルール同梱
・Firebaseが未接続なので、初回は「公開準備中」と表示されます。
・その画面の「操作画面を試す」で端末内デモを使えます。デモの記録は他端末と同期しません。
・公開URLの作成／Firebase本番ログインと同期テストは未完了です。

■ 公開までの作業（本当に必要な最小部分）
① GitHubの無料アカウントをChatGPTのGitHub接続につなぐ。
   ChatGPT側からコードをアップロードできる場合は、こちらが作業します。
   GitHub Pagesは公開リポジトリなら無料プランで利用できます。
② Google Firebase (https://console.firebase.google.com/) の無料Sparkプランでプロジェクトを作成。
   ・Authenticationでメール/パスワードを有効にする
   ・Firestore Databaseを作成（本番モード）
   ・firebase-config.js の設定値（apiKey/authDomain/projectId/appId/ownerEmail）を設定する
   ・firestore.rules の ADMIN_EMAIL_HERE を自分の認証メールに書き換えてFirebaseのルール画面に貼り付けて公開する
   ・Firebase Authentication → Settings → Authorized domains で実際の公開ドメインを追加する
③ 管理用メールアドレスで本人確認してログインする。記録を登録すれば一般閲覧画面にも反映される。

■ 安全について
・パスワードやFirebaseサービスアカウントの秘密鍵をこのチャットや公開リポジトリに送らないでください。
・firebase-config.js に含む Firebase Web API config は公開用設定です。これは認証の代わりではありません。
・管理者メールを知られても書き込みはできません。認証済みメールとFirestore rulesを両方確認します。
・FirestoreルールのADMIN_EMAIL_HEREを未変更のまま運用しないでください。
・投稿や選手写真など「公開サイトに登録した内容」は誰でも閲覧可能になります。
・無料枠や公開サービスには利用制限があり、永久保証ではありません。
・Firebaseクラウドの同期は実接続後に検証が必要です。

■ サイト内での操作
・クラブ切替／選手プロフィール／試合／順位表／SNSなどは閲覧者も利用できます。
・管理者だけが登録、編集、戦術変更、バックアップなどを利用できます。
・複数端末で同時に編集した場合は競合警告を表示し、意図せぬ上書きを防ぎます。
・サイトをSafariで開き、共有→ホーム画面に追加、でアプリ風に起動できます。

Firebase無料枠：https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
GitHub Pages：https://docs.github.com/en/pages/quickstart

本サイトはEA FC/FIFA/FotMob/ドラえもんの公式製品や公式ロゴを使用しない非公式の個人記録ツールです。
