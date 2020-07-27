"use strict";
const utils = require("../utils");

let myProducts = async (event) => {
  if (event.userObject.isDistributor == false)
    return utils.customFailResponse("You are not a distributor", 401);
  try {
    let query = await utils.dynamo("query", {
      KeyConditionExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": event.userObject.username,
      },
    });
    let products = query.Items;
    products.shift(); // Remove the actual user account
    return utils.successResponse({ products });
  } catch (err) {
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.myProducts = utils.validateRequestBody(
  {
    username: "string",
    password: "string",
  },
  utils.ensureUser(myProducts)
);
