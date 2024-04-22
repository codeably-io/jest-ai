export enum Similarity {
	LOW = 'low',
	MID = 'mid',
	HIGH = 'high',
}

export enum SimilarityConfidenceThreshold {
	LOW = 0.7,
	MID = 0.75,
	HIGH = 0.85,
}

export function isSimilarByScore(rank: Similarity, score: number): boolean {
	const highSimilarity = score > SimilarityConfidenceThreshold.HIGH;
	const midSimilarity = score > SimilarityConfidenceThreshold.MID && score < SimilarityConfidenceThreshold.HIGH;
	const lowSimilarity = score < SimilarityConfidenceThreshold.LOW;

	switch(rank) {
		case Similarity.HIGH:
			return highSimilarity;
		case Similarity.MID:
			return midSimilarity || highSimilarity;
		case Similarity.LOW:
			return lowSimilarity || midSimilarity || highSimilarity;
		default:
			return false;
	}
}
