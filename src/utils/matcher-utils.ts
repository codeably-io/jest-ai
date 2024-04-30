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

  async function satisfiesStatementMatcher(
    statement: string,
    actual: string,
    model: string = "gpt-4-turbo" // gtp-3.5-turbo does an awful job with this task unfortunately
  ): Promise<boolean> {
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
						You are a comprehension utility that confirms whether or not a given statement is true within some context.
						The user will provide a statement. Using ONLY the provided context, you will determine if the statement is true or false.
						The context that you will analyse is provided below between the "---" characters.
						You will respond with only the text "true" or "false" and with no other characters or words.
						If the answer to the truthiness of the statement cannot be found within the context, respond with "false".
						ONLY USE INFORMATION FOUND WITHIN THE CONTEXT TO ANSWER THE QUESTION
						---
						${actual}
						---
					`,
        },
        {
          role: "user",
          content: `Within the provided context, is the following statement true or false: ${statement}`,
        },
      ],
      model,
      temperature: 0,
    });
    return completion.choices[0].message.content === "true";
  }

  return {
    semantic: semanticMatcher,
    absolute: absoluteMatcher,
    zodSchema: zodSchemaMatcher,
    tools: toolsMatcher,
    assistantTools: assistantToolsMatcher,
    satisfiesStatement: satisfiesStatementMatcher,
  };
}
