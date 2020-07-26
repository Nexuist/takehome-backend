const base = require("./base");
const utils = require("../utils");

let handler = require("../products/buy");

let call = async (json, pathParameters) =>
  await handler.buyProduct({
    body: JSON.stringify(json),
    pathParameters,
  });

let buy = async (quantity) =>
  await call(
    {
      buyerUsername: "andi",
      password: "blockchain",
      quantity,
    },
    {
      username: "supermarket",
      id: 1,
    }
  );

// update the buyer's wallet value
beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
  let value = 25;
  await utils.dynamo("update", {
    Key: {
      username: "andi",
      id: 0,
    },
    UpdateExpression: "SET #wallet = :value",
    ExpressionAttributeNames: {
      "#wallet": "wallet",
    },
    ExpressionAttributeValues: {
      ":value": value,
    },
  });
});

let result;
let prePurchaseProduct;
let product;
describe("buy a product", () => {
  beforeAll(async () => {
    prePurchaseProduct = (
      await utils.dynamo("get", {
        Key: {
          username: "supermarket",
          id: 1,
        },
      })
    ).Item;
    result = await buy(20);
    product = (
      await utils.dynamo("get", {
        Key: {
          username: "supermarket",
          id: 1,
        },
      })
    ).Item;
  });
  it("can buy a product", () =>
    expect(result).toHaveProperty("statusCode", 200));
  it("will decrease the buyer's wallet correctly", async () => {
    let buyer = (
      await utils.dynamo("get", {
        Key: {
          username: "andi",
          id: 0,
        },
      })
    ).Item;
    expect(buyer.wallet).toBe(5);
  });
  it("will increase the product's salesCount correctly", () =>
    expect(product.salesCount).toBe(prePurchaseProduct.salesCount + 20));
  it("will decrease the product's inventoryCount correctly", () =>
    expect(product.inventoryCount).toBe(
      prePurchaseProduct.inventoryCount - 20
    ));
  it("will record the sale in the product's sales array", () =>
    expect(product.sales[product.sales.length - 1].quantity).toBe(20));
  it("will not allow the buyer to buy more product than is available", async () => {
    let attempt = await buy(2000);
    expect(attempt).toHaveProperty("statusCode", 400);
  });
  it("will not allow the buyer to buy products they cannot afford", async () => {
    let attempt = await buy(6);
    expect(attempt).toHaveProperty("statusCode", 400);
  });
});
