import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type ModelMessage } from "ai";

const MODEL = "claude-sonnet-4-5";

export type StreamTextOptions = {
  system: string;
  messages: ModelMessage[];
};

export function createLateralStream({ system, messages }: StreamTextOptions) {
  return streamText({
    model: anthropic(MODEL),
    system,
    messages,
  });
}
