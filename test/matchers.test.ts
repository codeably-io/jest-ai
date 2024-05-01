import { Run } from "openai/src/resources/beta/threads/runs";
import { getMatchers } from "../src/utils/matcher-utils";
import { Similarity } from "../src/utils/similarity";

const embedQueryFn = jest.fn<number[], [string]>();
const pollFn = jest.fn<Partial<Run>, [string, string]>();

jest.mock("@langchain/openai", () => ({
  ...jest.requireActual("@langchain/openai"), // This line is necessary if you want to keep the original implementation of other functions
  OpenAIEmbeddings: jest.fn().mockImplementation(() => {
    return {
      embedQuery: embedQueryFn,
    };
  }),
}));
jest.mock("openai", () =>
  jest.fn().mockImplementation(() => {
    return {
      beta: {
        threads: {
          runs: {
            poll: pollFn,
          },
        },
      },
    };
  })
);

describe("Matchers", () => {
  describe("semantic matcher", () => {
    it("matches two semantically similar statements", async () => {
      const expected =
        "The winner of the 2023 Tour de France was Jonas Vingegaard";
      const actual =
        "Jonas Vingegaard was the 2023 winner of the Tour de France";
      embedQueryFn.mockImplementation((string) => {
        // TODO: add actual mock vectors here for the above strings
        if (string === expected) return [0.7];
        if (string === actual) return [1];
        return [0];
      });
      const matchers = getMatchers();
      const pass = await matchers.semantic(Similarity.MID, expected, actual);
      expect(embedQueryFn).toHaveBeenCalledWith(expected);
      expect(embedQueryFn).toHaveBeenCalledWith(actual);
      expect(pass).toEqual(true);
    });
  });

  describe("assistance tools matcher", () => {
    it("fails when the run does not resolve to requiring action", async () => {
      pollFn.mockImplementationOnce((threadId, runId) => {
        return {
          status: "completed",
        } as Partial<Run>;
      });
      const matchers = getMatchers();
      await expect(
        matchers.assistantTools(
          ["getWeather"],
          { thread_id: "threadId", id: "runId" } as Run,
          false
        )
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Run entered terminal state "completed" that did not require action"`
      );
      expect(pollFn).toHaveBeenCalledWith("threadId", "runId");
    });

    it("passes with a simple match on function name", async () => {
      pollFn.mockImplementationOnce((threadId, runId) => {
        return {
          status: "requires_action",
          required_action: {
            type: "submit_tool_outputs",
            submit_tool_outputs: {
              tool_calls: [
                {
                  type: "function",
                  function: {
                    name: "getWeather",
                  },
                },
              ],
            },
          },
        } as Partial<Run>;
      });
      const matchers = getMatchers();
      const pass = await matchers.assistantTools(
        ["getWeather"],
        { thread_id: "threadId", id: "runId" } as Run,
        false
      );
      expect(pass).toEqual(true);
      expect(pollFn).toHaveBeenCalledWith("threadId", "runId");
    });

    it("fails when the run requests tools that are not listed", async () => {
      pollFn.mockImplementationOnce((threadId, runId) => {
        return {
          status: "requires_action",
          required_action: {
            type: "submit_tool_outputs",
            submit_tool_outputs: {
              tool_calls: [
                {
                  type: "function",
                  function: {
                    name: "getTemperature",
                  },
                },
              ],
            },
          },
        } as Partial<Run>;
      });
      const matchers = getMatchers();
      const pass = await matchers.assistantTools(
        ["getWeather"],
        { thread_id: "threadId", id: "runId" } as Run,
        false
      );
      expect(pass).toEqual(false);
      expect(pollFn).toHaveBeenCalledWith("threadId", "runId");
    });

    it("passes with a match on arguments and name", async () => {
      pollFn.mockImplementationOnce((threadId, runId) => {
        return {
          status: "requires_action",
          required_action: {
            type: "submit_tool_outputs",
            submit_tool_outputs: {
              tool_calls: [
                {
                  type: "function",
                  function: {
                    name: "getWeather",
                    arguments: "New York City",
                  },
                },
              ],
            },
          },
        } as Partial<Run>;
      });
      const matchers = getMatchers();
      const pass = await matchers.assistantTools(
        [{ name: "getWeather", arguments: "New York City" }],
        { thread_id: "threadId", id: "runId" } as Run,
        false
      );
      expect(pass).toEqual(true);
      expect(pollFn).toHaveBeenCalledWith("threadId", "runId");
    });

    it("fails when the run requests tools with unexpected arguments", async () => {
      pollFn.mockImplementationOnce((threadId, runId) => {
        return {
          status: "requires_action",
          required_action: {
            type: "submit_tool_outputs",
            submit_tool_outputs: {
              tool_calls: [
                {
                  type: "function",
                  function: {
                    name: "getWeather",
                    arguments: "New York City",
                  },
                },
              ],
            },
          },
        } as Partial<Run>;
      });
      const matchers = getMatchers();
      const pass = await matchers.assistantTools(
        [{ name: "getWeather", arguments: "Albany" }],
        { thread_id: "threadId", id: "runId" } as Run,
        false
      );
      expect(pass).toEqual(false);
      expect(pollFn).toHaveBeenCalledWith("threadId", "runId");
    });

    it("fails when not all tool calls are matched", async () => {
      pollFn.mockImplementationOnce((threadId, runId) => {
        return {
          status: "requires_action",
          required_action: {
            type: "submit_tool_outputs",
            submit_tool_outputs: {
              tool_calls: [
                {
                  type: "function",
                  function: {
                    name: "getWeather",
                  },
                },
              ],
            },
          },
        } as Partial<Run>;
      });
      const matchers = getMatchers();
      const pass = await matchers.assistantTools(
        ["getWeather", "getTemperature"],
        { thread_id: "threadId", id: "runId" } as Run,
        true
      );
      expect(pass).toEqual(false);
      expect(pollFn).toHaveBeenCalledWith("threadId", "runId");
    });

    it("passes with all tool calls matched", async () => {
      pollFn.mockImplementationOnce((threadId, runId) => {
        return {
          status: "requires_action",
          required_action: {
            type: "submit_tool_outputs",
            submit_tool_outputs: {
              tool_calls: [
                {
                  type: "function",
                  function: {
                    name: "getWeather",
                    arguments: "New York City",
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "getWeather",
                    arguments: "San Francisco",
                  },
                },
              ],
            },
          },
        } as Partial<Run>;
      });
      const matchers = getMatchers();
      const pass = await matchers.assistantTools(
        [
          { name: "getWeather", arguments: "New York City" },
          { name: "getWeather", arguments: "San Francisco" },
        ],
        { thread_id: "threadId", id: "runId" } as Run,
        true
      );
      expect(pass).toEqual(true);
      expect(pollFn).toHaveBeenCalledWith("threadId", "runId");
    });
  });
});
