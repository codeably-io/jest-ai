import { getMatchers } from "../utils/matcher-utils";
import { Similarity } from "../utils/similarity";
import { MatcherUtils } from "expect";

export async function toSemanticallyMatch(
  this: MatcherUtils,
  received: string,
  expected: string
) {
  const matchers = getMatchers();
  const pass = await matchers.semantic(Similarity.MID, expected, received);

  if (pass) {
    return {
      message: () =>
        `Expected: ${this.utils.printExpected(
          expected
        )}\nReceived: ${this.utils.printReceived(received)}`,
      pass: true,
    };
  }
  return {
    message: () =>
      `Expected: ${this.utils.printExpected(
        expected
      )} to semantically match ${this.utils.printReceived(received)}`,
    pass: false,
  };
}
