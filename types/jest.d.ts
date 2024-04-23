/// <reference types="jest" />

import {type JestAIMatchers} from './matchers'
import { Similarity } from '../src/utils/similarity';
import { expect } from '@jest/globals';

declare global {
	namespace jest {
		interface Matchers<R = void, T = {}>
			extends JestAIMatchers<
				ReturnType<typeof expect.stringContaining>,
				R
			> {}
	}
}

export interface JestAiConfig {
	similarityThreshold: Similarity;
}
