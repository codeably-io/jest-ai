/// <reference types="jest" />

import { type JestAIMatchers } from './matchers'
import { type ConfigurableSimilarity } from '../src/utils/similarity';
import { expect } from '@jest/globals';

declare global {
	namespace jest {
		interface Matchers<R = void, T = {}>
			extends JestAIMatchers<
				ReturnType<typeof expect.stringContaining>,
				R
			> {}
	}
	var jestAiConfig: JestAiConfig;
}

export interface JestAiConfig extends ConfigurableSimilarity {}
