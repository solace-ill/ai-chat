import { NextRequest, NextResponse } from "next/server";
import { convertToModelMessages, type UIMessage } from "ai";
import { getProblemById } from "@/lib/problems";
import { createLateralStream } from "@/lib/claude";
import { getGameMasterPrompt, getHintPrompt, getSolvePrompt } from "@/lib/prompts";
import type { Action } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body is required" }, { status: 400 });
  }

  const { messages, problemId, action, hintsUsed = 0 } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages must be a non-empty array" },
      { status: 400 }
    );
  }

  if (messages.length > 50) {
    return NextResponse.json(
      { error: "messages must not exceed 50 items" },
      { status: 400 }
    );
  }

  for (const msg of messages) {
    if (
      typeof msg !== "object" ||
      msg === null ||
      !["user", "assistant", "system"].includes((msg as Record<string, unknown>).role as string)
    ) {
      return NextResponse.json(
        { error: "Each message must have a valid role ('user' | 'assistant')" },
        { status: 400 }
      );
    }
    const content = (msg as Record<string, unknown>).content;
    if (typeof content === "string" && content.length > 500) {
      return NextResponse.json(
        { error: "Each message content must not exceed 500 characters" },
        { status: 400 }
      );
    }
  }

  if (!problemId || typeof problemId !== "string") {
    return NextResponse.json({ error: "problemId is required" }, { status: 400 });
  }

  const validActions: Action[] = ["question", "hint", "solve"];
  if (!action || !validActions.includes(action as Action)) {
    return NextResponse.json(
      { error: "action must be 'question', 'hint', or 'solve'" },
      { status: 400 }
    );
  }

  if (typeof hintsUsed !== "number" || hintsUsed < 0) {
    return NextResponse.json(
      { error: "hintsUsed must be a non-negative number" },
      { status: 400 }
    );
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 400 });
  }

  let system: string;
  switch (action as Action) {
    case "question":
      system = getGameMasterPrompt(problem);
      break;
    case "hint":
      system = getHintPrompt(problem, hintsUsed);
      break;
    case "solve":
      system = getSolvePrompt(problem);
      break;
  }

  try {
    const modelMessages = await convertToModelMessages(messages as UIMessage[]);
    const result = createLateralStream({ system, messages: modelMessages });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
