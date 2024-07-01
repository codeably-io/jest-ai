import { OpenAIEmbeddings } from '@langchain/openai';
import { cosineSimilarity } from './utils';


export class Embeddings {
	private static instance: Embeddings;
	private embedding: OpenAIEmbeddings;

	private constructor() {
		this.embedding = new OpenAIEmbeddings();
	}

	public static getInstance() {
		if (!Embeddings.instance) {
			Embeddings.instance = new Embeddings();
		}

		return Embeddings.instance;
	}

	public async compareEmbeddings(expected: string, actual: string) {
		const vectors = await Promise.all([
			Embeddings.instance.embedding.embedQuery(expected),
			Embeddings.instance.embedding.embedQuery(actual)
		]);

		return cosineSimilarity(vectors[0], vectors[1]);
	}
}
