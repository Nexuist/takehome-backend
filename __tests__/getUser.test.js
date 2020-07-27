const base = require("./base");
const utils = require("../utils");

let handler = require("../users/get");

beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
});

let result, body;
describe("get a list of products", () => {
  beforeAll(async () => {
    result = await handler.getUser({
      body: JSON.stringify({
        username: "andi",
        password: "blockchain",
      }),
    });
    body = JSON.parse(result.body);
  });
  it("succeeds", () => {
    expect(result).toHaveProperty("statusCode", 200);
  });
  it("does not include the account password", () => {
    expect(body).not.toHaveProperty("password", expect.anything());
  });
  it("includes the account email address", () => {
    expect(body).toHaveProperty("email", expect.anything());
  });
});
