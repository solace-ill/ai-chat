# AI Game Bot — 水平思考クイズ

AIゲームマスターと遊ぶ水平思考クイズアプリ。Yes/Noで答えられる質問を重ねて謎を解こう。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **AI**: Vercel AI SDK + `@ai-sdk/anthropic` (`claude-sonnet-4.5`)
- **デプロイ**: Google Cloud Run（Docker コンテナ）

## セットアップ

### 1. 環境変数の設定

`.env.local` を作成し、Anthropic API キーを設定します。

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_NAME=AI Game Bot
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと問題一覧が表示されます。

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバー起動
npm run lint      # ESLint 実行
npm run test      # テスト実行（Vitest）
npm run test:watch  # テストウォッチモード
```

## Docker（Cloud Run 向け）

### ローカルでのビルドと起動

```bash
# イメージのビルド
docker build -t ai-chat .

# コンテナの起動
docker run -p 3080:3080 -e ANTHROPIC_API_KEY=sk-ant-... ai-chat
```

ブラウザで [http://localhost:3080](http://localhost:3080) を開いて動作確認します。

### Cloud Run へのデプロイ

```bash
# Artifact Registry へプッシュ
docker tag ai-chat gcr.io/<PROJECT_ID>/ai-chat
docker push gcr.io/<PROJECT_ID>/ai-chat

# Cloud Run にデプロイ
gcloud run deploy ai-chat \
  --image gcr.io/<PROJECT_ID>/ai-chat \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=sk-ant-...
```

## ゲームの遊び方

1. トップページから問題を選ぶ
2. AIゲームマスターが問題文（シチュエーション）を提示する
3. 「はい」「いいえ」で答えられる質問を入力して送信する
4. ヒントボタンで段階的なヒントを最大3回まで取得できる
5. 真相に気づいたら「答えを宣言する」モードに切り替えて宣言する
6. 正解するとフルストーリーが表示される

## プロジェクト構成

```
ai-chat/
├── app/
│   ├── page.tsx              # 問題選択ページ
│   ├── game/page.tsx         # ゲームページ
│   ├── api/lateral/route.ts  # 水平思考クイズAPI
│   └── layout.tsx
├── components/
│   ├── ChatWindow.tsx        # チャット表示
│   ├── MessageInput.tsx      # 入力フォーム（質問/回答宣言）
│   ├── HintButton.tsx        # ヒントボタン
│   ├── GameStatus.tsx        # ゲーム状態表示
│   └── ExplanationCard.tsx   # 正解後の解説カード
├── lib/
│   ├── problems.ts           # 問題データ（6問）
│   ├── prompts.ts            # システムプロンプト定義
│   ├── claude.ts             # AI SDK ラッパー
│   └── types.ts              # 型定義
├── Dockerfile                # Cloud Run 用マルチステージビルド
└── .env.local                # 環境変数（要作成）
```
