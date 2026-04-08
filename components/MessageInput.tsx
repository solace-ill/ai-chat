"use client";

import { useState, type KeyboardEvent } from "react";

type Mode = "question" | "solve";

type Props = {
  onSend: (content: string) => void;
  onSolve?: (content: string) => void;
  disabled: boolean;
};

export default function MessageInput({ onSend, onSolve, disabled }: Props) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<Mode>("question");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    if (mode === "solve" && onSolve) {
      onSolve(trimmed);
    } else {
      onSend(trimmed);
    }
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-zinc-950 pl-12 pr-4 pb-4">
      {onSolve && (
        <div className="flex gap-1 pb-2">
          <button
            onClick={() => setMode("question")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              mode === "question"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            質問する
          </button>
          <button
            onClick={() => setMode("solve")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              mode === "solve"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            答えを宣言する
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          className="flex-1 resize-none rounded-xl bg-zinc-800 text-zinc-100 placeholder-zinc-500 px-4 py-2.5 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 max-h-32"
          placeholder={
            mode === "solve"
              ? "真相を宣言してください..."
              : "質問を入力してください（例：その人は生きていますか？）"
          }
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={`shrink-0 rounded-xl text-white px-4 py-2.5 text-sm font-medium transition-colors disabled:bg-zinc-700 disabled:text-zinc-500 ${
            mode === "solve"
              ? "bg-emerald-600 hover:bg-emerald-500"
              : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {mode === "solve" ? "宣言" : "送信"}
        </button>
      </div>
    </div>
  );
}
