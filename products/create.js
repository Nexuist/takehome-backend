"use strict";
const utils = require("../utils");

let createProduct = async (event) => {
  let { name, id, description, price } = event.validatedKeys;
  if (!event.userObject.isDistributor)
    return utils.customFailResponse(
      "You cannot create products because you are not a distributor",
      403
    );
  try {
    await utils.dynamo("put", {
      Item: {
        username: event.userObject.username,
        id,
        name,
        description,
        price,
        inventoryCount: 0,
        salesCount: 0,
        media: [],
        metadata: {},
        reviews: [],
        sales: [],
      },
      ConditionExpression: "attribute_not_exists(id)",
    });
    return utils.successResponse();
  } catch (err) {
    console.log(err);
    if (err.code == "ConditionalCheckFailedException")
      return utils.customFailResponse("Product ID is taken", 400);
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.createProduct = utils.validateRequestBody(
  {
    username: "string",
    password: "string",
    id: "number",
    name: "string",
    description: "string",
    price: "number",
  },
  utils.ensureUser(createProduct)
);
