import { getMatchers } from '../utils/matcher-utils';
import { ChatCompletion } from 'openai/src/resources/chat/completions';

export async function toHaveUsedAllTools(received: () => Promise<ChatCompletion>, expectedTools: string[]) {
	const matchers = getMatchers();
	const pass = await matchers.tools(expectedTools, received, true);

	if (pass) {
		return {
			message: () =>
				`Expected: ${this.utils.printExpected(expectedTools)}\nReceived: ${this.utils.printReceived(received)}`,
			pass: true,
		};
	}
	return {
		message: () =>
			`Expected all tools: ${this.utils.printExpected(expectedTools)} to have been used but they were not`,
		pass: false,
	};
}
