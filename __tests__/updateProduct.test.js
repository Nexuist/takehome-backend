const base = require("./base");
const utils = require("../utils");

let handler = require("../products/update");
const { dynamo } = require("../utils");

let call = async (json, pathParameters) =>
  await handler.updateProduct({
    body: JSON.stringify(json),
    pathParameters,
  });

// create testing product to update
beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
  await utils.dynamo("put", {
    Item: {
      username: "supermarket",
      id: 3,
      name: "test",
      description: "test",
      price: 3,
      inventoryCount: 0,
      salesCount: 0,
      media: ["a", "b", "c"],
      metadata: { a: 1, b: 2, c: 3 },
      reviews: [],
      sales: [],
    },
  });
});

let get = async () =>
  utils.dynamo("get", { Key: { username: "supermarket", id: 3 } });

let update = async (key, value) =>
  await call(
    {
      username: "supermarket",
      password: "blockchain",
      key,
      value,
    },
    {
      distributor: "supermarket",
      id: 3,
    }
  );

describe("update product", () => {
  it("can update a product name", async () => {
    let attempt = await update("name", "Apple");
    expect(attempt).toHaveProperty("statusCode", 200);
    let product = await get();
    expect(product.Item).toHaveProperty("name", "Apple");
  });
  it("can update a product price", async () => {
    let attempt = await update("price", 10);
    expect(attempt).toHaveProperty("statusCode", 200);
    let product = await get();
    expect(product.Item).toHaveProperty("price", 10);
  });
  it("can update product metadata", async () => {
    let attempt = await update("metadata", {
      a: 2,
      b: 4,
      c: 6,
    });
    expect(attempt).toHaveProperty("statusCode", 200);
    let product = await get();
    expect(product.Item.metadata).toHaveProperty("a", 2);
  });
  it("won't let you update a product key with the wrong value type", async () => {
    expect(await update("price", "strawberry")).toHaveProperty(
      "statusCode",
      400
    );
  });
  it("won't let you update a non-existent product", async () => {
    expect(
      await call(
        { password: "blockchain", key: "name", value: "Strawberry" },
        { username: "supermarket", id: 5 }
      )
    ).toHaveProperty("statusCode", 400);
  });
  it("won't let you update a non-editable key", async () => {
    expect(await update("reviews", [])).toHaveProperty("statusCode", 400);
  });
});
