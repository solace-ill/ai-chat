import Link from "next/link";
import { problems } from "@/lib/problems";
import type { Problem } from "@/lib/types";

const DIFFICULTY_LABEL: Record<Problem["difficulty"], string> = {
  easy: "かんたん",
  medium: "ふつう",
  hard: "むずかしい",
};

const DIFFICULTY_CLASS: Record<Problem["difficulty"], string> = {
  easy: "bg-emerald-900 text-emerald-300 border-emerald-700",
  medium: "bg-amber-900 text-amber-300 border-amber-700",
  hard: "bg-red-900 text-red-300 border-red-700",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">水平思考クイズ</h1>
          <p className="text-zinc-400 text-sm">
            AIゲームマスターにYes/Noで答えられる質問を投げかけて謎を解こう
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              href={`/game?id=${problem.id}`}
              className="group block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-indigo-700 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-zinc-100 font-semibold text-base group-hover:text-indigo-300 transition-colors">
                  {problem.title}
                </h2>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={`text-xs rounded-full px-2 py-0.5 border ${DIFFICULTY_CLASS[problem.difficulty]}`}>
                    {DIFFICULTY_LABEL[problem.difficulty]}
                  </span>
                  <span className="text-xs text-zinc-500 bg-zinc-800 rounded-full px-2 py-0.5 border border-zinc-700">
                    #{problem.id}
                  </span>
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                {problem.situation}
              </p>
              <div className="mt-4 text-xs text-indigo-400 group-hover:text-indigo-300 font-medium">
                プレイする →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
