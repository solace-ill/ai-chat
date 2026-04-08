import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatWindow from "./ChatWindow";
import type { Message } from "@/lib/types";

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe("ChatWindow — メッセージ描画", () => {
  it("ユーザーメッセージが表示される", () => {
    const messages: Message[] = [{ role: "user", content: "その人は生きていますか？" }];
    render(<ChatWindow messages={messages} isStreaming={false} />);
    expect(screen.getByText("その人は生きていますか？")).toBeInTheDocument();
  });

  it("アシスタントメッセージが表示される", () => {
    const messages: Message[] = [{ role: "assistant", content: "はい" }];
    render(<ChatWindow messages={messages} isStreaming={false} />);
    expect(screen.getByText("はい")).toBeInTheDocument();
  });

  it("複数メッセージがすべて表示される", () => {
    const messages: Message[] = [
      { role: "user", content: "質問1" },
      { role: "assistant", content: "いいえ" },
      { role: "user", content: "質問2" },
      { role: "assistant", content: "はい" },
    ];
    render(<ChatWindow messages={messages} isStreaming={false} />);
    expect(screen.getByText("質問1")).toBeInTheDocument();
    expect(screen.getByText("いいえ")).toBeInTheDocument();
    expect(screen.getByText("質問2")).toBeInTheDocument();
    expect(screen.getByText("はい")).toBeInTheDocument();
  });

  it("メッセージが空のとき何も表示しない", () => {
    const { container } = render(<ChatWindow messages={[]} isStreaming={false} />);
    // バブル要素がないことを確認（scrollTarget の div のみ残る）
    const bubbles = container.querySelectorAll(".rounded-2xl");
    expect(bubbles.length).toBe(0);
  });
});

describe("ChatWindow — タイピングインジケーター", () => {
  it("isStreaming=true のときインジケーターが表示される", () => {
    render(<ChatWindow messages={[]} isStreaming={true} />);
    expect(screen.getByRole("status", { name: "返答中" })).toBeInTheDocument();
  });

  it("isStreaming=false のときインジケーターが表示されない", () => {
    render(<ChatWindow messages={[]} isStreaming={false} />);
    expect(screen.queryByRole("status", { name: "返答中" })).not.toBeInTheDocument();
  });
});

describe("ChatWindow — 自動スクロール", () => {
  it("初回レンダリング時に scrollIntoView が呼ばれる", () => {
    render(<ChatWindow messages={[]} isStreaming={false} />);
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("メッセージが追加されたとき scrollIntoView が再度呼ばれる", () => {
    const { rerender } = render(<ChatWindow messages={[]} isStreaming={false} />);
    const callsBefore = vi.mocked(window.HTMLElement.prototype.scrollIntoView).mock.calls.length;

    rerender(
      <ChatWindow
        messages={[{ role: "user", content: "新しいメッセージ" }]}
        isStreaming={false}
      />
    );

    const callsAfter = vi.mocked(window.HTMLElement.prototype.scrollIntoView).mock.calls.length;
    expect(callsAfter).toBeGreaterThan(callsBefore);
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("isStreaming が変わったとき scrollIntoView が呼ばれる", () => {
    const { rerender } = render(<ChatWindow messages={[]} isStreaming={false} />);
    const callsBefore = vi.mocked(window.HTMLElement.prototype.scrollIntoView).mock.calls.length;

    rerender(<ChatWindow messages={[]} isStreaming={true} />);

    const callsAfter = vi.mocked(window.HTMLElement.prototype.scrollIntoView).mock.calls.length;
    expect(callsAfter).toBeGreaterThan(callsBefore);
  });
});
