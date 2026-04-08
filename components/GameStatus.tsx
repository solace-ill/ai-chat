"use client";

import type { GameState } from "@/lib/types";

type Props = {
  problemTitle: string;
  gameState: GameState;
};

export default function GameStatus({ problemTitle, gameState }: Props) {
  const { status, hintsUsed } = gameState;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-zinc-400 text-xs shrink-0">問題</span>
        <span className="text-zinc-100 text-sm font-medium truncate">{problemTitle}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {hintsUsed > 0 && (
          <span className="text-xs text-zinc-400">
            💡 ヒント {hintsUsed}/3
          </span>
        )}
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            status === "solved"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-700 text-zinc-300"
          }`}
        >
          {status === "solved" ? "正解！" : "進行中"}
        </span>
      </div>
    </div>
  );
}
