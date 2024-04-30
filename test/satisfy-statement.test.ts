import { getMatchers } from "../src/utils/matcher-utils";

// These tests intentionally make live requests to OpenAI
jest.setTimeout(20000);
const maybe = process.env.OPENAI_API_KEY ? describe : describe.skip;

maybe("satisfy statement", () => {
  it("passes when the information clearly matches", async () => {
    const matchers = getMatchers();
    const pass = await matchers.satisfiesStatement(
      "The 2023 winner of the Tour De France was Jonas Vingegaard",
      "Jonas Vingegaard was the winner of the 2023 Tour de France"
    );
    expect(pass).toEqual(true);
  });
  it("does not pass when the information is mismatched, despite the statement being globally correct", async () => {
    const matchers = getMatchers();
    const pass = await matchers.satisfiesStatement(
      "The capital of France is Paris.",
      "France is a beautiful country with many great sites. Some of these can be found in the capital, Nice, where locals and tourists alike spend long summer days relaxing at the beach."
    );
    expect(pass).toEqual(false);
  });
  it("passes when the information is matched, despite the statement being globally incorrect", async () => {
    const matchers = getMatchers();
    const pass = await matchers.satisfiesStatement(
      "The capital of France is Normandy.",
      "France is a beautiful country with many great sites. Some of these can be found in the capital, Normandy, where locals and tourists alike spend long summer days relaxing at the beach."
    );
    expect(pass).toEqual(true);
  });
  it("does not pass when the information for the statement is missing", async () => {
    const matchers = getMatchers();
    const pass = await matchers.satisfiesStatement(
      "The largest city in France is Paris.",
      "France is a beautiful country with many great sites. Some of these can be found in the capital, Paris, where locals and tourists alike spend long summer days relaxing at the beach."
    );
    expect(pass).toEqual(false);
  });
  it("does not pass when the information for the statement is missing, despite the statement being globally correct", async () => {
    const matchers = getMatchers();
    const pass = await matchers.satisfiesStatement(
      "The capital of Australia is Canberra.",
      "France is a beautiful country with many great sites. Some of these can be found in the capital, Paris, where locals and tourists alike spend long summer days relaxing at the beach."
    );
    expect(pass).toEqual(false);
  });
  it("passes the flight number README example", async () => {
    const matchers = getMatchers();
    const pass = await matchers.satisfiesStatement(
      "It contains a question asking for your flight number.",
      "Hello, I am a chatbot set to help you with information for your flight. Can you please share your flight number with me?"
    );
    expect(pass).toEqual(true);
  });
  it("passes the surname README example", async () => {
    const matchers = getMatchers();
    const pass = await matchers.satisfiesStatement(
      "It asks for your last name.",
      "What is your surname?"
    );
    expect(pass).toEqual(true);
  });
});
