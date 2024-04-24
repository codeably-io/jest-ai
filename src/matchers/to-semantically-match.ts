import { getMatchers } from "../utils/matcher-utils";
import { SimilarityLevel } from "../utils/similarity";
import { MatcherUtils } from "expect";

export async function toSemanticallyMatch(
  this: MatcherUtils,
  received: string,
  expected: string
) {
  const matchers = getMatchers();
  const {
		similarityLevel,
		similarityThreshold,
	} = global.jestAiConfig;
	const explicitThresholdLevel = similarityLevel?.toUpperCase() as SimilarityLevel | undefined;
	const threshold = similarityThreshold ?? explicitThresholdLevel ?? SimilarityLevel.MID

	const pass = await matchers.semantic(threshold, expected, received);

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
