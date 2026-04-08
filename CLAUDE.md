# CLAUDE.md — AI Game Chat Bot

## プロジェクト概要

AIを活用した水平思考クイズアプリ。認証不要の公開Webアプリ。

## 技術スタック

| 項目 | 採用技術 |
|------|---------|
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| AI | Vercel AI SDK + `@ai-sdk/anthropic` (`claude-sonnet-4-5`) |
| バックエンド | Next.js API Routes |
| 会話履歴 | セッション内のみ（クライアントstate） |
| デプロイ | Google Cloud Run |

## アーキテクチャ

```
ai-chat/
├── app/
│   ├── page.tsx              # トップページ（問題選択）
│   ├── game/
│   │   └── page.tsx          # 水平思考クイズページ
│   ├── api/
│   │   └── lateral/
│   │       └── route.ts      # 水平思考クイズAPI
│   └── layout.tsx
├── components/
│   ├── ChatWindow.tsx         # チャット表示コンポーネント
│   ├── MessageInput.tsx       # 入力フォーム
│   ├── HintButton.tsx         # ヒント要求ボタン
│   └── GameStatus.tsx         # ゲーム進行状況表示
├── lib/
│   ├── problems.ts            # 問題データ
│   ├── prompts.ts             # システムプロンプト定義
│   └── types.ts               # 型定義
├── Dockerfile                 # Cloud Run用
└── .env.local                 # 環境変数（ローカル）
```

## ゲーム機能仕様

### 水平思考クイズ

ユーザーがAIに質問を投げ、AIが「Yes / No / 関係ない」で答えることで謎を解くゲーム。

**ゲームフロー:**
1. AIが問題文（シチュエーション）を提示する
2. ユーザーがYes/Noで答えられる質問を入力する
3. AIが「はい」「いいえ」「関係ありません」「一部正解です」のいずれかで回答する
4. ユーザーが真相を答えたら正解判定を行う
5. 正解後にフルストーリー（解説）を表示する

**機能要件:**
- **Yes/No応答**: AIは必ず上記4択のいずれかで回答。余分な情報を漏らさない
- **ヒントシステム**: ヒントボタンを押すと段階的なヒントを最大3回まで提供
- **複数問題セット**: 問題一覧から選択できる
- **正解後の解説表示**: 解決時に詳細なストーリー解説をカード形式で表示

## API設計

### POST `/api/lateral`

水平思考クイズの質問応答エンドポイント。

**リクエスト:**
```json
{
  "messages": [{ "role": "user" | "assistant", "content": "string" }],
  "problemId": "string",
  "action": "question" | "hint" | "solve"
}
```

**レスポンス（ストリーミング）:**
Vercel AI SDK の `streamText` + `toUIMessageStreamResponse()` を使用。

## システムプロンプト方針

### 水平思考クイズ用プロンプト

- AIはゲームマスターとして振る舞い、問題の答えを絶対に直接教えない
- 回答は「はい」「いいえ」「関係ありません」「一部正解です」に限定する
- ヒントリクエスト時は段階的に情報を開示（直接答えにならない範囲で）
- 正解判定はユーザーの回答が真相と本質的に一致しているかで判断

## 環境変数

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_NAME=AI Game Bot
```

## Dockerfileの方針

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3080
CMD ["node", "server.js"]
```

Cloud Run用に `next.config.ts` で `output: 'standalone'` を設定すること。

## UIデザイン方針

- テーマ: モダン・シンプル（ダークモード対応推奨）
- フォント: システムフォント or Geist
- チャットUIはバブル形式
- ゲーム状態（進行中 / 正解 / ヒント使用回数）はヘッダー or サイドバーに常時表示
- レスポンシブ対応（モバイルファースト）

## 開発コマンド

```bash
npm run dev      # ローカル開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLint
npm run test     # テスト実行
```

## テストコード作成時の厳守事項

- テストは必ず実際の機能を検証すること
- `expect(true).toBe(true)` のような意味のないアサーションは絶対にしない
- 各テストケースは具体的な入力と期待される出力を検証すること
- モックは必要最小限に留め、実際の動作に近い形でテストすること
- ハードコーディングによるテスト通過は禁止
- 本番コードに `if (testMode)` のような条件分岐を入れない
