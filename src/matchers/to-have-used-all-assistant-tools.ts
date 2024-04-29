import type {
  RequiredActionFunctionToolCall,
  Run,
} from "openai/src/resources/beta/threads/runs";
import { getMatchers } from "../utils/matcher-utils";
import { MatcherUtils } from "expect";

export async function toHaveUsedAllAssistantTools(
  this: MatcherUtils,
  received: Run,
  expectedTools: string[] | RequiredActionFunctionToolCall.Function[]
) {
  const matchers = getMatchers();
  const pass = await matchers.assistantTools(expectedTools, received, true);

  if (pass) {
    return {
      message: () =>
        `Expected: ${this.utils.printExpected(
          expectedTools
        )}\nReceived: ${this.utils.printReceived(received)}`,
      pass: true,
    };
  }
  return {
    message: () =>
      `Expected all tools: ${this.utils.printExpected(
        expectedTools
      )} to have been used but they were not`,
    pass: false,
  };
}
