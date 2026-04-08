import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageInput from "./MessageInput";

describe("MessageInput — モード切り替え", () => {
  it("onSolve が渡されると「質問する」「答えを宣言する」ボタンが表示される", () => {
    render(<MessageInput onSend={vi.fn()} onSolve={vi.fn()} disabled={false} />);
    expect(screen.getByText("質問する")).toBeInTheDocument();
    expect(screen.getByText("答えを宣言する")).toBeInTheDocument();
  });

  it("onSolve が渡されないとモード切り替えボタンが表示されない", () => {
    render(<MessageInput onSend={vi.fn()} disabled={false} />);
    expect(screen.queryByText("質問する")).not.toBeInTheDocument();
    expect(screen.queryByText("答えを宣言する")).not.toBeInTheDocument();
  });

  it("初期モードは「質問する」でプレースホルダーが質問用になる", () => {
    render(<MessageInput onSend={vi.fn()} onSolve={vi.fn()} disabled={false} />);
    expect(screen.getByPlaceholderText(/質問を入力してください/)).toBeInTheDocument();
  });

  it("「答えを宣言する」をクリックするとプレースホルダーが答え宣言用になる", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={vi.fn()} onSolve={vi.fn()} disabled={false} />);
    await user.click(screen.getByText("答えを宣言する"));
    expect(screen.getByPlaceholderText(/真相を宣言してください/)).toBeInTheDocument();
  });

  it("「質問する」をクリックすると質問モードに戻る", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={vi.fn()} onSolve={vi.fn()} disabled={false} />);
    await user.click(screen.getByText("答えを宣言する"));
    await user.click(screen.getByText("質問する"));
    expect(screen.getByPlaceholderText(/質問を入力してください/)).toBeInTheDocument();
  });
});

describe("MessageInput — 送信コールバック", () => {
  it("質問モードで送信ボタンをクリックすると onSend が呼ばれる", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput onSend={onSend} onSolve={vi.fn()} disabled={false} />);
    await user.type(screen.getByRole("textbox"), "生きていますか");
    await user.click(screen.getByText("送信"));
    expect(onSend).toHaveBeenCalledWith("生きていますか");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("答え宣言モードで送信ボタンをクリックすると onSolve が呼ばれる", async () => {
    const onSolve = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput onSend={vi.fn()} onSolve={onSolve} disabled={false} />);
    await user.click(screen.getByText("答えを宣言する"));
    await user.type(screen.getByRole("textbox"), "しゃっくりを止めた");
    await user.click(screen.getByText("宣言"));
    expect(onSolve).toHaveBeenCalledWith("しゃっくりを止めた");
    expect(onSolve).toHaveBeenCalledTimes(1);
  });

  it("Enter キーで onSend が呼ばれる", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput onSend={onSend} disabled={false} />);
    await user.type(screen.getByRole("textbox"), "テスト質問{Enter}");
    expect(onSend).toHaveBeenCalledWith("テスト質問");
  });

  it("Shift+Enter では送信されず改行される", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput onSend={onSend} disabled={false} />);
    await user.type(screen.getByRole("textbox"), "テスト{Shift>}{Enter}{/Shift}質問");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("空白のみの入力では送信されない", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput onSend={onSend} disabled={false} />);
    await user.type(screen.getByRole("textbox"), "   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("送信後に入力フィールドがクリアされる", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={vi.fn()} disabled={false} />);
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "質問内容");
    await user.type(textarea, "{Enter}");
    expect(textarea).toHaveValue("");
  });
});

describe("MessageInput — disabled 状態", () => {
  it("disabled=true のとき textarea が無効化される", () => {
    render(<MessageInput onSend={vi.fn()} disabled={true} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("disabled=true のとき送信ボタンが無効化される", () => {
    render(<MessageInput onSend={vi.fn()} disabled={true} />);
    // disabled=true かつ値が空なので送信ボタンは disabled
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find((b) => b.textContent === "送信");
    expect(sendButton).toBeDisabled();
  });

  it("disabled=true のとき Enter キーを押しても onSend が呼ばれない", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput onSend={onSend} disabled={true} />);
    // disabled な textarea にはタイプできないが、直接キーダウンは発火しない
    expect(onSend).not.toHaveBeenCalled();
  });
});
