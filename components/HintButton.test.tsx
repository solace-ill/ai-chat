import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HintButton from "./HintButton";

describe("HintButton — 残りヒント数表示", () => {
  it("hintsUsed=0 のとき「残り 3」と表示される", () => {
    render(<HintButton hintsUsed={0} onHint={vi.fn()} disabled={false} />);
    expect(screen.getByText("残り 3")).toBeInTheDocument();
  });

  it("hintsUsed=1 のとき「残り 2」と表示される", () => {
    render(<HintButton hintsUsed={1} onHint={vi.fn()} disabled={false} />);
    expect(screen.getByText("残り 2")).toBeInTheDocument();
  });

  it("hintsUsed=2 のとき「残り 1」と表示される", () => {
    render(<HintButton hintsUsed={2} onHint={vi.fn()} disabled={false} />);
    expect(screen.getByText("残り 1")).toBeInTheDocument();
  });

  it("hintsUsed=3 のとき「残り 0」と表示される", () => {
    render(<HintButton hintsUsed={3} onHint={vi.fn()} disabled={false} />);
    expect(screen.getByText("残り 0")).toBeInTheDocument();
  });
});

describe("HintButton — 無効化", () => {
  it("hintsUsed=3（使い切り）でボタンが disabled になる", () => {
    render(<HintButton hintsUsed={3} onHint={vi.fn()} disabled={false} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disabled=true のとき hintsUsed に関わらずボタンが disabled になる", () => {
    render(<HintButton hintsUsed={0} onHint={vi.fn()} disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("hintsUsed=2（残り1）かつ disabled=false でボタンが有効", () => {
    render(<HintButton hintsUsed={2} onHint={vi.fn()} disabled={false} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });
});

describe("HintButton — コールバック", () => {
  it("クリックで onHint が呼ばれる", async () => {
    const onHint = vi.fn();
    const user = userEvent.setup();
    render(<HintButton hintsUsed={0} onHint={onHint} disabled={false} />);
    await user.click(screen.getByRole("button"));
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it("disabled=true のときクリックしても onHint が呼ばれない", async () => {
    const onHint = vi.fn();
    const user = userEvent.setup();
    render(<HintButton hintsUsed={0} onHint={onHint} disabled={true} />);
    await user.click(screen.getByRole("button"));
    expect(onHint).not.toHaveBeenCalled();
  });

  it("hintsUsed=3（使い切り）のときクリックしても onHint が呼ばれない", async () => {
    const onHint = vi.fn();
    const user = userEvent.setup();
    render(<HintButton hintsUsed={3} onHint={onHint} disabled={false} />);
    await user.click(screen.getByRole("button"));
    expect(onHint).not.toHaveBeenCalled();
  });
});
