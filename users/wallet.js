"use strict";
const crypto = require("crypto");
const utils = require("../utils");

let updateWallet = async (event) => {
  let { value, password } = event.validatedKeys;
  let { username } = event.pathParameters;
  if (!utils.authorizeUser(username, password))
    return utils.customFailResponse("Authorization failed");
  try {
    await utils.dynamo("update", {
      Key: {
        username,
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
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (err) {
    return utils.customFailResponse("Server error");
  }
};

module.exports.updateWallet = utils.validateRequestBody(
  {
    password: "string",
    value: "number",
  },
  updateWallet
);
