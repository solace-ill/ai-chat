import { describe, it, expect } from "vitest";
import { problems, getProblemById } from "./problems";

describe("getProblemById", () => {
  it("存在する ID で正しい問題を返す", () => {
    const problem = getProblemById("001");
    expect(problem).toBeDefined();
    expect(problem!.id).toBe("001");
    expect(problem!.title).toBe("ウェイターの判断");
  });

  it("別の存在する ID でも正しい問題を返す", () => {
    const problem = getProblemById("002");
    expect(problem).toBeDefined();
    expect(problem!.id).toBe("002");
  });

  it("存在しない ID で undefined を返す", () => {
    expect(getProblemById("999")).toBeUndefined();
  });

  it("空文字の ID で undefined を返す", () => {
    expect(getProblemById("")).toBeUndefined();
  });

  it("大文字小文字の違う ID で undefined を返す", () => {
    // ID は "001" 形式なのでアルファベット違いは無関係だが念のため
    expect(getProblemById("ABC")).toBeUndefined();
  });
});

describe("problems データ", () => {
  it("問題が1件以上ある", () => {
    expect(problems.length).toBeGreaterThanOrEqual(1);
  });

  it("全問題が必須フィールド（id / title / situation / answer / explanation）を持つ", () => {
    for (const p of problems) {
      expect(p.id, `id が空: ${p.title}`).toBeTruthy();
      expect(p.title, `title が空: id=${p.id}`).toBeTruthy();
      expect(p.situation, `situation が空: id=${p.id}`).toBeTruthy();
      expect(p.answer, `answer が空: id=${p.id}`).toBeTruthy();
      expect(p.explanation, `explanation が空: id=${p.id}`).toBeTruthy();
    }
  });

  it("全問題の id が文字列型である", () => {
    for (const p of problems) {
      expect(typeof p.id).toBe("string");
    }
  });

  it("ID が重複していない", () => {
    const ids = problems.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
