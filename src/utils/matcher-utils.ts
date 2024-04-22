import { Embeddings } from './embeddings';
import { isSimilarByScore, Similarity } from './similarity';
import { z } from 'zod';
import { ChatCompletion } from 'openai/src/resources/chat/completions';

export function getMatchers() {
	const embeddings = new Embeddings();

	async function semanticMatcher(rank: Similarity, expected: string, actual: string): Promise<boolean> {
		// TODO: clean the noise out of "actual" using NLP
		const score = await embeddings.compareEmbeddings(expected, actual);

		return isSimilarByScore(rank, score);
	}

	function absoluteMatcher(expected: string, actual: string): boolean {
		return expected === actual;
	}

	function zodSchemaMatcher(expected: z.Schema<any, any>, actual: string): boolean {
		try {
			return expected.parse(JSON.parse(actual))
		} catch (e) {
			return false;
		}
	}

	async function toolsMatcher(expectedTools: string[], actual: () => Promise<ChatCompletion>, allCheck: boolean): Promise<boolean> {
		const result = await actual();
		const tool_calls = result.choices[0]?.message.tool_calls;

		if (!result.choices[0]?.message) {
			throw new Error("No response to read tool calls from");
		}

		if (!tool_calls) {
			return false;
		}

		if (allCheck) {
			return tool_calls.every(call => expectedTools.includes(call.function.name))
		}

		return tool_calls.some(call => expectedTools.includes(call.function.name))
	}

	return {
		semantic: semanticMatcher,
		absolute: absoluteMatcher,
		zodSchema: zodSchemaMatcher,
		tools: toolsMatcher,
	}
}
