import { Embeddings } from "./embeddings";
import { isSimilarByScore, Similarity } from "./similarity";
import { z } from "zod";
import OpenAI from "openai";

import type { ChatCompletion } from "openai/src/resources/chat/completions";
import type {
  RequiredActionFunctionToolCall,
  Run,
} from "openai/src/resources/beta/threads/runs";
import { matchToolCallsToExpectedTools } from "./utils";

export function getMatchers() {
  const embeddings = new Embeddings();

  async function semanticMatcher(
    rank: Similarity,
    expected: string,
    actual: string
  ): Promise<boolean> {
    // TODO: clean the noise out of "actual" using NLP
    const score = await embeddings.compareEmbeddings(expected, actual);

    return isSimilarByScore(rank, score);
  }

  function absoluteMatcher(expected: string, actual: string): boolean {
    return expected === actual;
  }

  function zodSchemaMatcher(
    expected: z.Schema<any, any>,
    actual: string
  ): boolean {
    try {
      return expected.parse(JSON.parse(actual));
    } catch (e) {
      return false;
    }
  }

  async function toolsMatcher(
    expectedTools: string[],
    actual: () => Promise<ChatCompletion>,
    allCheck: boolean
  ): Promise<boolean> {
    const result = await actual();

    if (!result.choices[0]?.message) {
      throw new Error("No response to read tool calls from");
    }

    const tool_calls = result.choices[0]?.message.tool_calls;

    if (!tool_calls) {
      return false;
    }

    return matchToolCallsToExpectedTools(tool_calls, expectedTools, allCheck);
  }

  async function assistantToolsMatcher(
    expectedTools: string[] | RequiredActionFunctionToolCall.Function[],
    actual: Run,
    allCheck: boolean
  ): Promise<boolean> {
    const openai = new OpenAI();
    const run = await openai.beta.threads.runs.poll(
      actual.thread_id,
      actual.id
    );

    if (run.status !== "requires_action" || !run.required_action) {
      throw new Error(
        `Run entered terminal state "${run.status}" that did not require action`
      );
    }

    if (run.required_action.type !== "submit_tool_outputs") {
      // Safeguarding - this is always submit_tool_outputs right now
      throw new Error(
        `Run required action type is "${run.required_action.type}" instead of "submit_tool_outputs"`
      );
    }

    const tool_calls = run.required_action.submit_tool_outputs.tool_calls;

    if (!tool_calls) {
      return false;
    }
    return matchToolCallsToExpectedTools(tool_calls, expectedTools, allCheck);
  }

  return {
    semantic: semanticMatcher,
    absolute: absoluteMatcher,
    zodSchema: zodSchemaMatcher,
    tools: toolsMatcher,
    assistantTools: assistantToolsMatcher,
  };
}
