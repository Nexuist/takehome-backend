const base = require("./base");
const utils = require("../utils");

let handler = require("../products/mine");

beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
});

let result, body;
describe("get a list of my products", () => {
  beforeAll(async () => {
    result = await handler.myProducts({
      body: JSON.stringify({
        username: "supermarket",
        password: "blockchain",
      }),
    });
    body = JSON.parse(result.body);
  });
  it("succeeds", () => {
    expect(result).toHaveProperty("statusCode", 200);
  });
  it("does not include the actual user account as part of the products", () => {
    expect(body.products[0]).not.toHaveProperty("password", expect.anything());
  });
  it("includes revealing information such as sales", () => {
    expect(body.products[0]).toHaveProperty("salesCount", expect.anything());
    expect(body.products[0]).toHaveProperty("sales", expect.anything());
  });
  it("will not retrieve products for non-distributor accounts", async () => {
    let result = await handler.myProducts({
      body: JSON.stringify({
        username: "andi",
        password: "blockchain",
      }),
    });
    expect(result).toHaveProperty("statusCode", 401);
  });
});
