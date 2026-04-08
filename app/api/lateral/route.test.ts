/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

vi.mock("@/lib/claude", () => ({
  createLateralStream: vi.fn().mockReturnValue({
    toUIMessageStreamResponse: vi.fn().mockReturnValue(
      new Response("stream", { status: 200 })
    ),
  }),
}));

const VALID_MESSAGES = [
  {
    id: "msg-1",
    role: "user",
    content: "その人は生きていますか？",
    parts: [{ type: "text", text: "その人は生きていますか？" }],
  },
];

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/lateral", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/lateral — バリデーションエラー (400)", () => {
  it("JSON が不正なら 400 を返す", async () => {
    const req = new NextRequest("http://localhost/api/lateral", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("messages が空配列なら 400 を返す", async () => {
    const res = await POST(makeRequest({ messages: [], problemId: "001", action: "question" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/messages/);
  });

  it("messages が配列でないなら 400 を返す", async () => {
    const res = await POST(makeRequest({ messages: "bad", problemId: "001", action: "question" }));
    expect(res.status).toBe(400);
  });

  it("messages の要素に role がないなら 400 を返す", async () => {
    const res = await POST(makeRequest({
      messages: [{ content: "質問" }],
      problemId: "001",
      action: "question",
    }));
    expect(res.status).toBe(400);
  });

  it("messages の role が不正な値なら 400 を返す", async () => {
    const res = await POST(makeRequest({
      messages: [{ role: "invalid", content: "質問" }],
      problemId: "001",
      action: "question",
    }));
    expect(res.status).toBe(400);
  });

  it("problemId がないなら 400 を返す", async () => {
    const res = await POST(makeRequest({ messages: VALID_MESSAGES, action: "question" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/problemId/);
  });

  it("action がないなら 400 を返す", async () => {
    const res = await POST(makeRequest({ messages: VALID_MESSAGES, problemId: "001" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/action/);
  });

  it("action が不正な値なら 400 を返す", async () => {
    const res = await POST(makeRequest({ messages: VALID_MESSAGES, problemId: "001", action: "invalid" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/action/);
  });

  it("存在しない problemId なら 400 を返す", async () => {
    const res = await POST(makeRequest({ messages: VALID_MESSAGES, problemId: "999", action: "question" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Problem not found/);
  });

  it("hintsUsed が負の数なら 400 を返す", async () => {
    const res = await POST(makeRequest({
      messages: VALID_MESSAGES,
      problemId: "001",
      action: "hint",
      hintsUsed: -1,
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/hintsUsed/);
  });
});

describe("POST /api/lateral — 正常系", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("action=question で 200 のストリーミングレスポンスを返す", async () => {
    const res = await POST(makeRequest({
      messages: VALID_MESSAGES,
      problemId: "001",
      action: "question",
    }));
    expect(res.status).toBe(200);
  });

  it("action=hint で 200 のストリーミングレスポンスを返す", async () => {
    const res = await POST(makeRequest({
      messages: VALID_MESSAGES,
      problemId: "001",
      action: "hint",
      hintsUsed: 0,
    }));
    expect(res.status).toBe(200);
  });

  it("action=solve で 200 のストリーミングレスポンスを返す", async () => {
    const res = await POST(makeRequest({
      messages: VALID_MESSAGES,
      problemId: "001",
      action: "solve",
    }));
    expect(res.status).toBe(200);
  });

  it("action=question で createLateralStream が適切な引数で呼ばれる", async () => {
    const { createLateralStream } = await import("@/lib/claude");
    await POST(makeRequest({
      messages: VALID_MESSAGES,
      problemId: "001",
      action: "question",
    }));
    expect(createLateralStream).toHaveBeenCalledOnce();
    const call = vi.mocked(createLateralStream).mock.calls[0][0];
    expect(call.system).toBeTruthy();
    expect(Array.isArray(call.messages)).toBe(true);
    expect(call.messages).toHaveLength(1);
    expect(call.messages[0].role).toBe("user");
  });
});
