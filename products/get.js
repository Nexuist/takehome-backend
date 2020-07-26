"use strict";
const utils = require("../utils");

let getProducts = async (event) => {
  let { distributor } = event.pathParameters;
  try {
    let query = await utils.dynamo("query", {
      KeyConditionExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": distributor,
      },
    });
    if (query.Items.length == 0)
      return utils.customFailResponse(
        "No products listed or no account with this username exists",
        400
      );
    let products = query.Items;
    let isDistributor = products[0].isDistributor;
    if (!isDistributor)
      return utils.customFailResponse("Account is not a distributor", 400);
    products.shift(); // Remove the actual user account
    products = products.map((x) => {
      delete x.salesCount;
      delete x.sales;
      return x;
    });
    return utils.successResponse({ products });
  } catch (err) {
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.getProducts = getProducts;
