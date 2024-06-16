export enum SimilarityLevel {
	LOW = 'LOW',
	MID = 'MID',
	HIGH = 'HIGH',
}
export type ConfigSimilarityLevel = 'high' | 'mid' | 'low';

export enum DefaultSimilarityConfidenceThreshold {
	LOW = 0.7,
	MID = 0.75,
	HIGH = 0.85,
}

export type SimilarityThresholds = Record<SimilarityLevel, number>

export interface ConfigurableSimilarity {
	similarityLevel?: ConfigSimilarityLevel;
	similarityThreshold?: number;
	similarityThresholds?: Partial<Record<ConfigSimilarityLevel, number>>;
}

function similarityThresholdsConfig(): SimilarityThresholds {
	const {
		similarityThresholds: configSimilarityThresholds,
	} = global.jestAiConfig ?? {};

	return {
		[SimilarityLevel.LOW]: configSimilarityThresholds?.['low'] ?? DefaultSimilarityConfidenceThreshold.LOW,
		[SimilarityLevel.MID]: configSimilarityThresholds?.['mid'] ?? DefaultSimilarityConfidenceThreshold.MID,
		[SimilarityLevel.HIGH]: configSimilarityThresholds?.['high'] ?? DefaultSimilarityConfidenceThreshold.HIGH,
	}
}

export function isSimilarByScore(level: SimilarityLevel, score: number): boolean {
	const thresholdsConfig = similarityThresholdsConfig();
	const highSimilarity = score > thresholdsConfig.HIGH;
	const midSimilarity = score > thresholdsConfig.MID && score < thresholdsConfig.HIGH;
	const lowSimilarity = score < thresholdsConfig.LOW;

	switch(level) {
		case SimilarityLevel.HIGH:
			return highSimilarity;
		case SimilarityLevel.MID:
			return midSimilarity || highSimilarity;
		case SimilarityLevel.LOW:
			return lowSimilarity || midSimilarity || highSimilarity;
		default:
			return false;
	}
}
