import { getMatchers } from "../utils/matcher-utils";
import { MatcherUtils } from "expect";

export async function toSatisfyStatement(
  this: MatcherUtils,
  received: string,
  expected: string
) {
  const matchers = getMatchers();
  const pass = await matchers.satisfiesStatement(expected, received);

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
        received
      )} to satisfy the statement: ${this.utils.printReceived(expected)}`,
    pass: false,
  };
}
