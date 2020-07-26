"use strict";
const utils = require("../utils");

let updateProduct = async (event) => {
  let { key, value } = event.validatedKeys;
  let product = event.productObject;
  try {
    await utils.dynamo("update", {
      Key: {
        username: product.username,
        id: product.id,
      },
      UpdateExpression: "SET #key = :value",
      ExpressionAttributeNames: {
        "#key": key,
      },
      ExpressionAttributeValues: {
        ":value": value,
      },
    });
    return utils.successResponse();
  } catch (err) {
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.updateProduct = utils.validateRequestBody(
  {
    username: "string",
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
  utils.ensureUser(utils.ensureProduct(updateProduct))
);
