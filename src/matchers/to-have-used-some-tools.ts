import { getMatchers } from '../utils/matcher-utils';
import { ChatCompletion } from 'openai/src/resources/chat/completions';

export async function toHaveUsedSomeTools(received: () => Promise<ChatCompletion>, expectedTools: string[]) {
	const matchers = getMatchers();
	const pass = await matchers.tools(expectedTools, received, false);

	if (pass) {
		return {
			message: () =>
				`Expected: ${this.utils.printExpected(expectedTools)}\nReceived: ${this.utils.printReceived(received)}`,
			pass: true,
		};
	}
	return {
		message: () =>
			`Expected some tools: ${this.utils.printExpected(expectedTools)}\n to have been used, but they were not`,
		pass: false,
	};
}
