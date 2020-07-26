"use strict";
const utils = require("../utils");

let buyProduct = async (event) => {
  let { buyerUsername, password, quantity } = event.validatedKeys;
  let { username, id } = event.pathParameters;
  if ((await utils.authorizeUser(buyerUsername, password)) == false)
    return utils.customFailResponse("Authorization failed", 401);
  let product = await utils.dynamo("get", {
    Key: { username, id },
  });
  if (!product.Item)
    return utils.customFailResponse("Product does not exist", 400);
  product = product.Item;
  let buyer = (
    await utils.dynamo("get", {
      Key: { username: buyerUsername, id: 0 },
    })
  ).Item;
  let cost = product.price * quantity;
  if (cost > buyer.wallet)
    return utils.customFailResponse("You cannot afford this product", 400);
  try {
    // Run as a transaction so if any part fails all changes are rejected
    // Prevents customers from losing money without also receiving the product
    await utils.dynamo("transactWrite", {
      TransactItems: [
        {
          Update: {
            TableName: "takehome",
            Key: {
              username: buyerUsername,
              id: 0,
            },
            UpdateExpression: "SET #wallet = :newWallet",
            ExpressionAttributeNames: { "#wallet": "wallet" },
            ExpressionAttributeValues: { ":newWallet": buyer.wallet - cost },
          },
        },
        {
          Update: {
            TableName: "takehome",
            Key: {
              username,
              id,
            },
            UpdateExpression:
              "SET #salesCount = :newSalesCount, #inventoryCount = :newInventoryCount, #sales = list_append(#sales, :newSale)",
            ExpressionAttributeNames: {
              "#salesCount": "salesCount",
              "#inventoryCount": "inventoryCount",
              "#sales": "sales",
            },
            ExpressionAttributeValues: {
              ":newSalesCount": product.salesCount + quantity,
              ":newInventoryCount": product.inventoryCount - quantity,
              ":newSale": [
                {
                  quantity,
                  timestamp: +new Date(),
                },
              ],
            },
          },
        },
      ],
    });
    return utils.successResponse();
  } catch (err) {
    return utils.customFailResponse("Server error", 500);
  }
};

// TODO: utils.successResponse
// TODO: utils.authenticateUser middleware
// TODO: utils.ensureProduct middleware
module.exports.buyProduct = utils.validateRequestBody(
  {
    buyerUsername: "string",
    password: "string",
    quantity: "number",
  },
  buyProduct
);
