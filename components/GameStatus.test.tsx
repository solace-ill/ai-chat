import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GameStatus from "./GameStatus";
import type { GameState } from "@/lib/types";

const PLAYING_STATE: GameState = { status: "playing", hintsUsed: 0 };
const SOLVED_STATE: GameState = { status: "solved", hintsUsed: 0 };

describe("GameStatus — 問題タイトルの表示", () => {
  it("渡された problemTitle が表示される", () => {
    render(<GameStatus problemTitle="ウェイターの判断" gameState={PLAYING_STATE} />);
    expect(screen.getByText("ウェイターの判断")).toBeInTheDocument();
  });

  it("別の problemTitle も正しく表示される", () => {
    render(<GameStatus problemTitle="エレベーターの謎" gameState={PLAYING_STATE} />);
    expect(screen.getByText("エレベーターの謎")).toBeInTheDocument();
  });
});

describe("GameStatus — ゲームステータス表示", () => {
  it("status='playing' のとき「進行中」が表示される", () => {
    render(<GameStatus problemTitle="テスト問題" gameState={PLAYING_STATE} />);
    expect(screen.getByText("進行中")).toBeInTheDocument();
  });

  it("status='solved' のとき「正解！」が表示される", () => {
    render(<GameStatus problemTitle="テスト問題" gameState={SOLVED_STATE} />);
    expect(screen.getByText("正解！")).toBeInTheDocument();
  });

  it("status='playing' のとき「正解！」は表示されない", () => {
    render(<GameStatus problemTitle="テスト問題" gameState={PLAYING_STATE} />);
    expect(screen.queryByText("正解！")).not.toBeInTheDocument();
  });

  it("status='solved' のとき「進行中」は表示されない", () => {
    render(<GameStatus problemTitle="テスト問題" gameState={SOLVED_STATE} />);
    expect(screen.queryByText("進行中")).not.toBeInTheDocument();
  });
});

describe("GameStatus — ヒント使用数の表示", () => {
  it("hintsUsed=0 のときヒント表示が出ない", () => {
    render(<GameStatus problemTitle="テスト問題" gameState={{ status: "playing", hintsUsed: 0 }} />);
    expect(screen.queryByText(/ヒント/)).not.toBeInTheDocument();
  });

  it("hintsUsed=1 のとき「ヒント 1/3」が表示される", () => {
    render(<GameStatus problemTitle="テスト問題" gameState={{ status: "playing", hintsUsed: 1 }} />);
    expect(screen.getByText(/ヒント 1\/3/)).toBeInTheDocument();
  });

  it("hintsUsed=2 のとき「ヒント 2/3」が表示される", () => {
    render(<GameStatus problemTitle="テスト問題" gameState={{ status: "playing", hintsUsed: 2 }} />);
    expect(screen.getByText(/ヒント 2\/3/)).toBeInTheDocument();
  });

  it("hintsUsed=3 のとき「ヒント 3/3」が表示される", () => {
    render(<GameStatus problemTitle="テスト問題" gameState={{ status: "playing", hintsUsed: 3 }} />);
    expect(screen.getByText(/ヒント 3\/3/)).toBeInTheDocument();
  });
});
