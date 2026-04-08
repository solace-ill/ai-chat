"use client";

const MAX_HINTS = 3;

type Props = {
  hintsUsed: number;
  onHint: () => void;
  disabled: boolean;
};

export default function HintButton({ hintsUsed, onHint, disabled }: Props) {
  const remaining = MAX_HINTS - hintsUsed;
  const exhausted = remaining <= 0;

  return (
    <button
      onClick={onHint}
      disabled={disabled || exhausted}
      className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-zinc-300 transition-colors"
    >
      <span>💡</span>
      <span>ヒント</span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${exhausted ? "bg-zinc-700 text-zinc-500" : "bg-indigo-600 text-white"}`}>
        残り {remaining}
      </span>
    </button>
  );
}
