const base = require("./base");
const utils = require("../utils");

let handler = require("../products/get");

beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
});

let result, body;
describe("get a list of products", () => {
  beforeAll(async () => {
    result = await handler.getProducts({
      pathParameters: { distributor: "supermarket" },
    });
    body = JSON.parse(result.body);
  });
  it("succeeds", () => {
    expect(result).toHaveProperty("statusCode", 200);
  });
  it("does not include the actual user account as part of the products", () => {
    expect(body.products[0]).not.toHaveProperty("password", expect.anything());
  });
  it("does not include revealing information such as sales", () => {
    expect(body.products[0]).not.toHaveProperty(
      "salesCount",
      expect.anything()
    );
    expect(body.products[0]).not.toHaveProperty("sales", expect.anything());
  });
  it("will not retrieve products for non-distributor accounts", async () => {
    let result = await handler.getProducts({
      pathParameters: { distributor: "andi" },
    });
    expect(result).toHaveProperty("statusCode", 400);
  });
});
