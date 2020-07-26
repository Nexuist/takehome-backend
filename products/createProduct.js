"use strict";
const utils = require("../utils");

let createProduct = async (event) => {
  let { password, id, name, description, price } = event.validatedKeys;
  let { username } = event.pathParameters;
  if ((await utils.authorizeUser(username, password)) == false)
    return utils.customFailResponse("Authorization failed", 401);
  let user = await utils.dynamo("get", {
    Key: {
      username,
      id: 0,
    },
  });
  if (!user.Item.isDistributor)
    return utils.customFailResponse(
      "You cannot create products because you are not a distributor",
      403
    );
  try {
    await utils.dynamo("put", {
      Item: {
        username,
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
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (err) {
    if (err.code == "ConditionalCheckFailedException")
      return utils.customFailResponse("Product ID is taken", 400);
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.createProduct = utils.validateRequestBody(
  {
    password: "string",
    id: "number",
    name: "string",
    description: "string",
    price: "number",
  },
  createProduct
);
