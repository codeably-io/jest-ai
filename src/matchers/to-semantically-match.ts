import { getMatchers } from '../utils/matcher-utils';
import { Similarity } from '../utils/similarity';

export async function toSemanticallyMatch(received: string, expected: string) {
	const matchers = getMatchers();
	const pass = await matchers.semantic(Similarity.HIGH, expected, received);

	if (pass) {
		return {
			message: () =>
				`Expected: ${this.utils.printExpected(expected)}\nReceived: ${this.utils.printReceived(received)}`,
			pass: true,
		};
	}
	return {
		message: () =>
			`Expected: ${this.utils.printExpected(expected)} to be included in ${this.utils.printReceived(received)}`,
		pass: false,
	};
}
