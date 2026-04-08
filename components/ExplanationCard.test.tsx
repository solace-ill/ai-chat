import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExplanationCard from "./ExplanationCard";

const EXPLANATION =
  "客は長時間しゃっくりが止まらず困っていた。ウェイターが驚かせてしゃっくりを止めた。";

describe("ExplanationCard — 解説文の表示", () => {
  it("渡された explanation が表示される", () => {
    render(<ExplanationCard explanation={EXPLANATION} onNextProblem={vi.fn()} />);
    expect(screen.getByText(EXPLANATION)).toBeInTheDocument();
  });

  it("「別の問題へ」ボタンが表示される", () => {
    render(<ExplanationCard explanation={EXPLANATION} onNextProblem={vi.fn()} />);
    expect(screen.getByRole("button", { name: "別の問題へ" })).toBeInTheDocument();
  });

  it("「正解！」見出しが表示される", () => {
    render(<ExplanationCard explanation={EXPLANATION} onNextProblem={vi.fn()} />);
    expect(screen.getByText(/正解！/)).toBeInTheDocument();
  });
});

describe("ExplanationCard — コールバック", () => {
  it("「別の問題へ」ボタンクリックで onNextProblem が呼ばれる", async () => {
    const onNextProblem = vi.fn();
    const user = userEvent.setup();
    render(<ExplanationCard explanation={EXPLANATION} onNextProblem={onNextProblem} />);
    await user.click(screen.getByRole("button", { name: "別の問題へ" }));
    expect(onNextProblem).toHaveBeenCalledTimes(1);
  });
});
