<div align="center">
<h1>jest-ai</h1>

<p>Custom jest matchers for testing AI applications</p>

</div>

---

<!-- prettier-ignore-start -->
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]
[![PRs Welcome][prs-badge]][prs]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
<!-- prettier-ignore-end -->

## The problem

Development of AI tools and applications is a process which requires a lot of manual testing and prompt tweaking.
Not only this, but for many developers the world of AI feels like "uncharted land"

## This solution

The `jest-ai` library provides a set of custom jest matchers
that you can use to extend jest. These will allow testing the calls and responses of LLMs in a more familiar way.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [With `@jest/globals`](#with-jestglobals)
  - [With TypeScript](#with-typescript)
- [Custom matchers](#custom-matchers)
  - [`toSemanticallyMatch`](#tosemanticallymatch)
  - [`toHaveUsedSomeTools`](#tohaveusedsometools)
  - [`toHaveUsedAllTools`](#tohaveusedalltools)
  - [`toMatchZodSchema`](#tomatchzodschema)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev jest-ai
```

or

for installation with [yarn](https://yarnpkg.com/) package manager.

```
yarn add --dev jest-ai
```

## Usage

First thing first, make sure you have `OPENAI_API_KEY` set in your environment variables.
as this library uses the OpenAI API to run the tests.

Import `jest-ai` once (for instance in your [tests setup
file][]) and you're good to go:

[tests setup file]:
  https://jestjs.io/docs/en/configuration.html#setupfilesafterenv-array

```javascript
// In your own jest-setup.js (or any other name)
import 'jest-ai'

// In jest.config.js add (if you haven't already)
setupFilesAfterEnv: ['<rootDir>/jest-setup.js']
```

### With `@jest/globals`

If you are using [`@jest/globals`][jest-globals announcement] with
[`injectGlobals: false`][inject-globals docs], you will need to use a different
import in your tests setup file:

```javascript
// In your own jest-setup.js (or any other name)
import 'jest-ai/jest-globals'
```

[jest-globals announcement]:
  https://jestjs.io/blog/2020/05/05/jest-26#a-new-way-to-consume-jest---jestglobals
[inject-globals docs]:
  https://jestjs.io/docs/configuration#injectglobals-boolean

### With TypeScript

If you're using TypeScript, make sure your setup file is a `.ts` and not a `.js`
to include the necessary types.

You will also need to include your setup file in your `tsconfig.json` if you
haven't already:

```
  // In tsconfig.json
  "include": [
    ...
    "./jest-setup.ts"
  ],
```

If TypeScript is not able to resolve the matcher methods, you can add the following to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["jest", "jest-ai"]
  }
}
```

## Custom matchers

### `toSemanticallyMatch`

```typescript
toSemanticallyMatch()
```

This allows checking if the response from the AI matches or includes the expected response.
It uses semantic comparison, which means that "What is your age?" and "When were you born?" could both pass.
This is in order to allow the natural and flexible nature of using AI.

#### Examples

```javascript
const response = await ai.getResponse('Hello')
// AI Response: "Hello, I am a chatbot set to help you with information for your flight. Can you please share your flight number with me?"
await expect(respone).toSemanticallyMatch('What is your flight number?')
```
or
```javascript
await expect('What is your surname?').toSemanticallyMatch('What is your last name?')
```

> :warning: **This matcher is async**: use async await when calling the matcher 
> This library uses a cosine calculation to check the similarity distance between the two strings.
> When running semantic match, a range of options can pass/fail. Currently, the threshold is set to 0.75.

<hr />

### `toHaveUsedSomeTools`

```typescript
toHaveUsedSomeTools()
```

Checks if some of the tools given to the LLM were used.

#### Examples

```javascript
const getResponse = async () => await ai.getResponse('Will my KL1234 flight be delayed?')
await expect(getResponse).toHaveUsedSomeTools(['get_flight_status'])
```

> :warning: **This matcher is async**: use async await when calling the matcher
> This matcher uses the OpenAI chat completion API to check tool calls.

<hr />

### `toHaveUsedAllTools`

```typescript
toHaveUsedAllTools()
```

Checks if all the tools given to the LLM were used. Will fail if any of the tools were not used.

#### Examples

```javascript
const getResponse = async () => await ai.getResponse('Will my KL1234 flight be delayed?')
await expect(getResponse).toHaveUsedAllTools(['get_flight_status', 'get_flight_delay'])
```

> :warning: **This matcher is async**: use async await when calling the matcher
> This matcher uses the OpenAI chat completion API to check tool calls.

<hr />

### `toMatchZodSchema`

```typescript
toMatchZodSchema()
```

Many times, we would like our LLMs to respond in a JSON format that's easier to work with later.
This matcher allows us to check if the response from the LLM matches a given Zod schema.

#### Examples

```javascript
const response = await ai.getResponse(`
    Name 3 animals, their height, and weight. Response in the following JSON format:
    {
        "animals": [
            {
                "name": "Elephant",
                "height": "3m",
                "weight": "6000kg"
            },
        ]
    }
`)
const expectedSchema = z.object({
    animals: z.array(z.object({
        name: z.string(),
        height: z.string(),
        weight: z.string()
    }))
})
expect(getResponse).toMatchZodSchema(expectedSchema)
```

<hr />

## LICENSE

MIT

<!-- prettier-ignore-start -->
[jest]: https://facebook.github.io/jest/
[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[version-badge]:
 https://img.shields.io/npm/v/jest-ai.svg?style=flat-square
[package]: https://www.npmjs.com/package/jest-ai
[downloads-badge]: 
  https://img.shields.io/npm/dm/jest-ai.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/jest-ai
[license-badge]: 
  https://img.shields.io/npm/l/jest-ai.svg?style=flat-square
[license]: https://github.com/codeably-io/jest-ai/blob/main/LICENSE
[prs-badge]: 
  https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[github-watch-badge]:
  https://img.shields.io/github/watchers/codeably-io/jest-ai.svg?style=social
[github-watch]: https://github.com/codeably-io/jest-ai/watchers
[github-star-badge]:
  https://img.shields.io/github/stars/codeably-io/jest-ai.svg?style=social
[github-star]: https://github.com/codeably-io/jest-ai/stargazers
<!-- prettier-ignore-end -->
