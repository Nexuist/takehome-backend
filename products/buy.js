"use strict";
const utils = require("../utils");

let buyProduct = async (event) => {
  let { quantity } = event.validatedKeys;
  let buyer = event.userObject;
  let product = event.productObject;
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
              username: buyer.username,
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
              username: product.username,
              id: product.id,
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
    console.log(err);
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.buyProduct = utils.validateRequestBody(
  {
    username: "string",
    password: "string",
    quantity: "number",
  },
  utils.ensureUser(utils.ensureProduct(buyProduct))
);
