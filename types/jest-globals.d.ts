import { type expect } from '@jest/globals'
import { type JestAIMatchers } from './matchers'

export {}
declare module '@jest/expect' {
	export interface Matchers<R extends void | Promise<void>>
		extends JestAIMatchers<
			ReturnType<typeof expect.stringContaining>,
			R
		> {}
}