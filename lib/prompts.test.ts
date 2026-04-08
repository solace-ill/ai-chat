import { describe, it, expect } from "vitest";
import { getGameMasterPrompt, getHintPrompt, getSolvePrompt } from "./prompts";
import type { Problem } from "./types";

const mockProblem: Problem = {
  id: "test-001",
  title: "テスト問題",
  situation: "テスト用シチュエーションの文章です。",
  answer: "テスト用の正解の文章です。",
  explanation: "テスト用の解説の文章です。",
};

describe("getGameMasterPrompt", () => {
  it("問題のシチュエーションを含む", () => {
    const prompt = getGameMasterPrompt(mockProblem);
    expect(prompt).toContain(mockProblem.situation);
  });

  it("真相（answer）を含む", () => {
    const prompt = getGameMasterPrompt(mockProblem);
    expect(prompt).toContain(mockProblem.answer);
  });

  it("4つの必須回答パターンをすべて含む", () => {
    const prompt = getGameMasterPrompt(mockProblem);
    expect(prompt).toContain("はい");
    expect(prompt).toContain("いいえ");
    expect(prompt).toContain("関係ありません");
    expect(prompt).toContain("一部正解です");
  });

  it("余分な情報を漏らさないルールを含む", () => {
    const prompt = getGameMasterPrompt(mockProblem);
    expect(prompt).toContain("ヒントになるような");
  });
});

describe("getHintPrompt", () => {
  it("1回目のヒントは hintLevel=1 として生成される", () => {
    const prompt = getHintPrompt(mockProblem, 0);
    expect(prompt).toContain("1回目のヒント");
  });

  it("2回目のヒントは hintLevel=2 として生成される", () => {
    const prompt = getHintPrompt(mockProblem, 1);
    expect(prompt).toContain("2回目のヒント");
  });

  it("3回目のヒントは hintLevel=3 として生成される", () => {
    const prompt = getHintPrompt(mockProblem, 2);
    expect(prompt).toContain("3回目のヒント");
  });

  it("問題のシチュエーションを含む", () => {
    const prompt = getHintPrompt(mockProblem, 0);
    expect(prompt).toContain(mockProblem.situation);
  });

  it("真相を含む", () => {
    const prompt = getHintPrompt(mockProblem, 0);
    expect(prompt).toContain(mockProblem.answer);
  });

  it("直接答えを教えないよう指示を含む", () => {
    const prompt = getHintPrompt(mockProblem, 0);
    expect(prompt).toContain("答えを教えることは絶対にしないでください");
  });
});

describe("getSolvePrompt", () => {
  it("真相（answer）を含む", () => {
    const prompt = getSolvePrompt(mockProblem);
    expect(prompt).toContain(mockProblem.answer);
  });

  it("問題のシチュエーションを含む", () => {
    const prompt = getSolvePrompt(mockProblem);
    expect(prompt).toContain(mockProblem.situation);
  });

  it("正解時の応答フォーマット指示を含む", () => {
    const prompt = getSolvePrompt(mockProblem);
    expect(prompt).toContain("正解です！");
  });

  it("不正解時の応答フォーマット指示を含む", () => {
    const prompt = getSolvePrompt(mockProblem);
    expect(prompt).toContain("違います");
  });
});
