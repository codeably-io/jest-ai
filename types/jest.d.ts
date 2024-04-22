/// <reference types="jest" />

import {type JestAIMatchers} from './matchers'

declare global {
	namespace jest {
		interface Matchers<R = void, T = {}>
			extends JestAIMatchers<
				ReturnType<typeof expect.stringContaining>,
				R
			> {}
	}
}