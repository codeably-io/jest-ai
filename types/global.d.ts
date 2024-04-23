import { JestAiConfig } from './jest';

declare global {
	namespace NodeJS {
		interface Global {
			jestAiConfig: JestAiConfig;
		}
	}
}
