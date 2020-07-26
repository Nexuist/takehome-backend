const base = require("./base");
const utils = require("../utils");

let handler = require("../products/create");

let call = async (json, pathParameters) =>
  await handler.createProduct({
    body: JSON.stringify(json),
    pathParameters,
  });

beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
  await utils.deleteKey("supermarket", 2);
});

describe("create product", () => {
  it("can create a product", async () => {
    let attempt = await call(
      {
        username: "supermarket",
        password: "blockchain",
        id: 2,
        name: "Pear",
        description: "A simple pear.",
        price: 2,
      },
      { distributor: "supermarket" }
    );
    expect(attempt).toHaveProperty("statusCode", 200);
    let product = await utils.dynamo("get", {
      Key: {
        username: "supermarket",
        id: 2,
      },
    });
    expect(product.Item).toHaveProperty("name", "Pear");
  });
  it("won't let you create a product without the correct password", async () => {
    let attempt = await call(
      {
        username: "supermarket",
        password: "blockerchain",
        id: 3,
        name: "Orange",
        description: "orange",
        price: 3,
      },
      { distributor: "supermarket" }
    );
    expect(attempt).toHaveProperty("statusCode", 401);
  });
  it("won't let you create a product unless you are a distributor", async () => {
    let attempt = await call(
      {
        username: "andi",
        password: "blockchain",
        id: 1,
        name: "Orange",
        description: "orange",
        price: 3,
      },
      { distributor: "andi" }
    );
    expect(attempt).toHaveProperty("statusCode", 403);
  });
});
