# 実装計画 TODO

## フェーズ 1: プロジェクトセットアップ

- [x] Next.js プロジェクト作成
- [x] AI SDK インストール（`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`）
  - 注: `@anthropic-ai/sdk` の代わりに Vercel AI SDK を採用
- [x] `.env.local` 作成（`ANTHROPIC_API_KEY` を設定）
- [x] `next.config.ts` に `output: 'standalone'` を設定
- [x] 不要なボイラープレート（`app/page.tsx` のデフォルト内容など）を削除

---

## フェーズ 2: 型定義・共通ロジック

- [x] `lib/types.ts` — 型定義を作成
  - `Message` 型（role, content）
  - `Problem` 型（id, title, situation, answer, explanation）
  - `GameState` 型（status: playing | solved, hintsUsed: number）
  - `Action` 型（"question" | "hint" | "solve"）
- [x] `lib/problems.ts` — 問題データを作成（最低5問）
  - 各問題に id / タイトル / シチュエーション / 真相 / 解説を持たせる
- [x] `lib/prompts.ts` — システムプロンプトを作成
  - ゲームマスタープロンプト（Yes/No応答ルール）
  - ヒント用プロンプト
  - 正解判定用プロンプト
- [x] `lib/claude.ts` — Anthropic SDK ラッパーを作成
  - ストリーミングレスポンス対応
  - エラーハンドリング

---

## フェーズ 3: バックエンド API

- [x] `app/api/lateral/route.ts` — POST エンドポイントを実装
  - `action: "question"` — Yes/No応答（SSEストリーミング）
  - `action: "hint"` — ヒント生成（SSEストリーミング）
  - `action: "solve"` — 正解判定 + 解説返却
  - リクエストバリデーション
  - エラーレスポンス（400 / 500）

---

## フェーズ 4: UIコンポーネント

- [x] `components/ChatWindow.tsx` — チャット履歴表示
  - ユーザー発言とAI応答をバブル形式で表示
  - 自動スクロール（最新メッセージへ）
  - ストリーミング中のタイピングインジケーター
- [x] `components/MessageInput.tsx` — メッセージ入力フォーム
  - テキスト入力 + 送信ボタン
  - Enter キーで送信
  - 送信中は無効化（二重送信防止）
- [x] `components/HintButton.tsx` — ヒント要求ボタン
  - 残りヒント回数を表示（最大3回）
  - 0回になったら無効化
- [x] `components/GameStatus.tsx` — ゲーム状態表示
  - 現在の問題タイトル
  - ゲーム状態（進行中 / 正解）
  - ヒント使用回数
- [x] `components/ExplanationCard.tsx` — 正解後の解説カード
  - フルストーリーをカード形式で表示
  - 「別の問題へ」ボタン

---

## フェーズ 5: ページ実装

- [x] `app/layout.tsx` — 共通レイアウト
  - フォント設定（Geist）
  - メタデータ（title, description）
  - ダークモード対応（Tailwind `dark:` クラス）
- [x] `app/page.tsx` — トップページ（問題選択）
  - 問題一覧をカードグリッドで表示
  - 問題タイトル・難易度・説明文を表示
  - 問題選択 → `/game?id=xxx` へ遷移
- [x] `app/game/page.tsx` — ゲームページ
  - URL パラメータから問題IDを取得
  - ゲーム状態を `useState` で管理（messages, gameState, isLoading）
  - `ChatWindow` + `MessageInput` + `HintButton` + `GameStatus` を組み合わせ
  - 正解時に `ExplanationCard` を表示
  - ストリーミングAPIの呼び出し処理

---

## フェーズ 6: Docker / Cloud Run 対応

- [x] `Dockerfile` を作成（マルチステージビルド）
- [x] `.dockerignore` を作成
- [x] `PORT` 環境変数対応（Cloud Run はポートを動的に指定）
- [x] `Makefile` を作成（install / dev / build / docker-build / docker-run / deploy）
- [x] ローカルで `docker build` & `docker run` で動作確認（`make docker-build && make docker-run`）
  - ビルド成果物（`standalone/server.js`, `.next/static/`）の生成は確認済み ✅
  - `docker build -t ai-chat .` → 成功 ✅
  - `docker run -p 3080:3080 -e ANTHROPIC_API_KEY=... ai-chat` → HTTP 200 を確認 ✅

---

## フェーズ 7: テスト

- [x] テストフレームワーク導入（Vitest + React Testing Library）
- [x] `lib/prompts.ts` の単体テスト
  - プロンプトが必要なフィールドを含むか検証
- [x] `app/api/lateral/route.ts` の統合テスト
  - `action: "question"` が正しいレスポンス形式を返すか
  - 不正リクエスト（action なし等）が 400 を返すか
- [x] `components/ChatWindow.tsx` のコンポーネントテスト
  - メッセージが正しく描画されるか
  - 自動スクロールが発火するか
- [x] `components/HintButton.tsx` のコンポーネントテスト
  - 残りヒント0回で無効化されるか
  - クリックでコールバックが呼ばれるか
- [x] `app/api/lateral/route.test.ts` を現行コードに合わせて修正（壊れている）
  - `VALID_MESSAGES` を `parts` を持つ UIMessage 形式に変更（`convertToModelMessages` が `parts` を要求するため）
  - `role: "system"` テストを修正（バリデーションで `"system"` を許容するよう変更したので 400 を返さなくなった）
  - `createLateralStream` の引数アサーション（`call.messages`）を `convertToModelMessages` の変換後の形式に合わせて修正
- [x] `components/MessageInput.tsx` のコンポーネントテスト追加
  - 「質問する」「答えを宣言する」モード切り替え
  - テキスト入力 → 送信ボタンクリックでコールバックが呼ばれるか
  - Enter キーで送信されるか（Shift+Enter では送信されないか）
  - `disabled=true` のとき送信できないか
  - 送信後に入力フィールドがクリアされるか
- [x] `components/ExplanationCard.tsx` のコンポーネントテスト追加
  - 解説文が表示されるか
  - 「別の問題へ」ボタンクリックでコールバックが呼ばれるか
- [x] `components/GameStatus.tsx` のコンポーネントテスト追加
  - 問題タイトルが表示されるか
  - `status: "playing"` で「進行中」、`status: "solved"` で「正解！」が表示されるか
  - ヒント使用数が0のときはヒント表示が出ないか
- [x] `lib/problems.ts` の単体テスト追加
  - `getProblemById` が正しい問題を返すか
  - 存在しない ID で `undefined` を返すか
  - 全問題が必須フィールド（id / title / situation / answer / explanation）を持つか

---

## フェーズ 8: 品質・仕上げ

- [x] `npm run lint` でエラーがないことを確認
- [x] `npm run build` でビルドエラーがないことを確認
- [x] モバイル表示の確認・調整
- [x] ローディング・エラー状態のUI確認（APIエラー時のフィードバック表示）
- [x] `README.md` に起動手順・環境変数を記載

---

## フェーズ 9: バグ修正・未実装機能

- [x] **正解判定ロジックの強化**（`game/page.tsx`）
  - `text.startsWith("正解です！")` だけでは AIの返答のわずかなブレで判定失敗する
  - `includes("正解です！")` への変更、または正解フラグを API レスポンスに含める方式への変更を検討
- [x] **`Problem` 型に `difficulty` フィールドを追加**（`lib/types.ts` / `lib/problems.ts`）
  - 仕様では問題一覧に難易度表示が必要だが未実装
  - `difficulty: "easy" | "medium" | "hard"` を追加し `app/page.tsx` のカードに表示
- [x] **API のリクエスト制限追加**（`app/api/lateral/route.ts`）
  - messages の件数上限（例：最大 50 件）を追加してトークン肥大化を防ぐ
  - message の文字数上限（例：1 件あたり 500 文字）のバリデーション追加
- [x] **`ChatWindow` の `key` を安定した値に変更**（`components/ChatWindow.tsx`）
  - 現在 `key={i}`（配列インデックス）を使用しており、メッセージ挿入時に不要な再レンダリングが発生しうる
  - UIMessage の `id` を利用する形に変更
