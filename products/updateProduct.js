"use strict";
const utils = require("../utils");

let updateProduct = async (event) => {
  let { key, value, password } = event.validatedKeys;
  let { username, id } = event.pathParameters;
  if ((await utils.authorizeUser(username, password)) == false)
    return utils.customFailResponse("Authorization failed", 401);
  let product = await utils.dynamo("get", {
    Key: { username, id },
  });
  if (!product.Item)
    return utils.customFailResponse("Product does not exist", 400);

  try {
    await utils.dynamo("update", {
      Key: {
        username,
        id,
      },
      UpdateExpression: "SET #key = :value",
      ExpressionAttributeNames: {
        "#key": key,
      },
      ExpressionAttributeValues: {
        ":value": value,
      },
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (err) {
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.updateProduct = utils.validateRequestBody(
  {
    password: "string",
    key: "string",
    value: (val, body) => {
      let key = body.key;
      let valueType = typeof val;
      let types = {
        name: "string",
        description: "string",
        price: "number",
        inventoryCount: "number",
        media: "array",
        metadata: "object",
      };
      if (!(key in types)) return false; // can't change any other key
      if (!(types[key] == valueType)) return false; // wrong value provided for the key
      return true;
    },
  },
  updateProduct
);
