"use client";

import { useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type TextUIPart } from "ai";
import { getProblemById } from "@/lib/problems";
import ChatWindow from "@/components/ChatWindow";
import MessageInput from "@/components/MessageInput";
import HintButton from "@/components/HintButton";
import GameStatus from "@/components/GameStatus";
import ExplanationCard from "@/components/ExplanationCard";
import type { GameState } from "@/lib/types";

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemId = searchParams.get("id") ?? "";
  const problem = getProblemById(problemId);

  const [gameState, setGameState] = useState<GameState>({
    status: "playing",
    hintsUsed: 0,
  });

  // ref で onFinish の stale closure を防ぐ
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/lateral" }),
    []
  );

  const introText = problem
    ? `【問題】\n${problem.situation}\n\nYes / Noで答えられる質問をどうぞ。`
    : "";

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport,
    messages: problem
      ? [
          {
            id: "intro",
            role: "assistant" as const,
            content: introText,
            parts: [{ type: "text" as const, text: introText } satisfies TextUIPart],
          },
        ]
      : [],
    onFinish: ({ message }) => {
      const text = message.parts
        .filter((p): p is TextUIPart => p.type === "text")
        .map((p) => p.text)
        .join("");
      if (gameStateRef.current.status === "playing" && text.includes("正解です！")) {
        setGameState((prev) => ({ ...prev, status: "solved" }));
      }
    },
  });

  if (!problem) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">問題が見つかりません。</p>
          <button
            onClick={() => router.push("/")}
            className="text-indigo-400 hover:underline text-sm"
          >
            問題一覧へ戻る
          </button>
        </div>
      </main>
    );
  }

  const isLoading = status === "submitted" || status === "streaming";

  function handleQuestion(content: string) {
    clearError();
    sendMessage(
      { text: content },
      { body: { problemId, action: "question", hintsUsed: gameState.hintsUsed } }
    );
  }

  function handleHint() {
    const currentHints = gameState.hintsUsed;
    setGameState((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    clearError();
    sendMessage(
      { text: `ヒント ${currentHints + 1} をください` },
      { body: { problemId, action: "hint", hintsUsed: currentHints } }
    );
  }

  function handleSolve(content: string) {
    clearError();
    sendMessage(
      { text: content },
      { body: { problemId, action: "solve", hintsUsed: gameState.hintsUsed } }
    );
  }

  const displayMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.parts
      .filter((p): p is TextUIPart => p.type === "text")
      .map((p) => p.text)
      .join(""),
  }));

  // submitted = 送信済・最初のトークン待ち → タイピングインジケーター表示
  const isWaitingForResponse = status === "submitted";

  return (
    <main className="flex flex-col h-svh bg-zinc-950">
      <GameStatus problemTitle={problem.title} gameState={gameState} />

      <ChatWindow messages={displayMessages} isStreaming={isWaitingForResponse} />

      {error && (
        <div className="mx-4 mb-2 flex items-center justify-between gap-4 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          <span>エラーが発生しました。もう一度お試しください。</span>
          <button
            onClick={clearError}
            className="shrink-0 text-xs text-red-400 underline hover:text-red-300"
          >
            閉じる
          </button>
        </div>
      )}

      {gameState.status === "solved" ? (
        <ExplanationCard
          explanation={problem.explanation}
          onNextProblem={() => router.push("/")}
        />
      ) : (
        <div className="border-t border-zinc-800">
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <HintButton
              hintsUsed={gameState.hintsUsed}
              onHint={handleHint}
              disabled={isLoading}
            />
          </div>
          <MessageInput
            onSend={handleQuestion}
            onSolve={handleSolve}
            disabled={isLoading}
          />
        </div>
      )}
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-zinc-950">
          <p className="text-zinc-400 text-sm">読み込み中...</p>
        </main>
      }
    >
      <GameContent />
    </Suspense>
  );
}
