import type { RequiredActionFunctionToolCall } from "openai/src/resources/beta/threads/runs";
import type { ChatCompletionMessageToolCall } from "openai/src/resources/chat/completions";

export function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i]! * vecB[i]!;
    normA += vecA[i]! * vecA[i]!;
    normB += vecB[i]! * vecB[i]!;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function isStringArray(array: any[]): array is string[] {
  return array.every((el) => typeof el === "string");
}

function isToolCallArray(
  array: any[]
): array is
  | ChatCompletionMessageToolCall[]
  | RequiredActionFunctionToolCall.Function[] {
  return array.every(
    (el) => typeof el.name === "string" && typeof el.arguments === "string"
  );
}

export function matchToolCallsToExpectedTools(
  toolCalls: ChatCompletionMessageToolCall[] | RequiredActionFunctionToolCall[],
  expectedTools:
    | string[]
    | RequiredActionFunctionToolCall.Function[]
    | ChatCompletionMessageToolCall.Function[],
  allCheck: boolean
) {
  if (isStringArray(expectedTools)) {
    if (allCheck) {
      return toolCalls.every((call) =>
        expectedTools.includes(call.function.name)
      );
    }

    return toolCalls.some((call) => expectedTools.includes(call.function.name));
  }
  if (isToolCallArray(expectedTools)) {
    if (allCheck) {
      return toolCalls.every((call) =>
        expectedTools.find(
          (expectedTool) =>
            expectedTool.name === call.function.name &&
            expectedTool.arguments === call.function.arguments
        )
      );
    }
    return toolCalls.some((call) =>
      expectedTools.find(
        (expectedTool) =>
          expectedTool.name === call.function.name &&
          expectedTool.arguments === call.function.arguments
      )
    );
  }
  return false;
}
