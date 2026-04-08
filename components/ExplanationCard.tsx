"use client";

type Props = {
  explanation: string;
  onNextProblem: () => void;
};

export default function ExplanationCard({ explanation, onNextProblem }: Props) {
  return (
    <div className="mx-4 mb-4 rounded-2xl border border-emerald-700 bg-zinc-900 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-emerald-400 text-lg">🎉</span>
        <h2 className="text-emerald-400 font-semibold text-sm">正解！ — フルストーリー</h2>
      </div>
      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
        {explanation}
      </p>
      <button
        onClick={onNextProblem}
        className="mt-4 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 transition-colors"
      >
        別の問題へ
      </button>
    </div>
  );
}
