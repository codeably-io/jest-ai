import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { cosineSimilarity } from './utils';


export class Embeddings {
	openai: any;

	constructor() {
		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY ?? "",
		});
	}

	async compareEmbeddings(expected: string, actual: string) {
		const openAI = new OpenAIEmbeddings();

		const vectors = await Promise.all([
			openAI.embedQuery(expected),
			openAI.embedQuery(actual)
		]);

		return cosineSimilarity(vectors[0], vectors[1]);
	}
}
