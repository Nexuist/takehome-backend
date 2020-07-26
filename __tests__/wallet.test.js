const base = require("./base");
const utils = require("../utils");

let handler = require("../users/wallet");

let call = async (json, pathParameters) =>
  await handler.updateWallet({
    body: JSON.stringify(json),
    pathParameters,
  });

beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
});

describe("wallet update", () => {
  it("updates the wallet value", async () => {
    let attempt = await call({
      username: "andi",
      password: "blockchain",
      value: 500,
    });
    expect(attempt).toHaveProperty("statusCode", 200);
  });
  it("won't let you update a wallet without the correct password", async () => {
    let attempt = await call(
      {
        username: "andi",
        password: "blockerchain",
        value: 500,
      },
      { username: "andi" }
    );
    expect(attempt).toHaveProperty("statusCode", 401);
  });
});
