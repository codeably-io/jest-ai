import { z } from 'zod';
import { getMatchers } from '../utils/matcher-utils';

export function toMatchZodSchema(received: z.Schema<any, any>, expected: string) {
	const matchers = getMatchers();
	const pass = matchers.zodSchema(received, expected);

	return {
		message: () =>
			`Expected: ${this.utils.printExpected(expected)}\n to match schema: ${this.utils.printReceived(received.toString())}`,
		pass,
	};
}
