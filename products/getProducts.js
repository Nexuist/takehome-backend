"use strict";
const utils = require("../utils");

let getProducts = async (event) => {
  let { username } = event.pathParameters;
  try {
    let query = await utils.dynamo("query", {
      KeyConditionExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": username,
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
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        products,
      }),
    };
  } catch (err) {
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.getProducts = getProducts;
