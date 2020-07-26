"use strict";
const crypto = require("crypto");
const utils = require("../utils");

let updateWallet = async (event) => {
  let { username, value } = event.validatedKeys;
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
    return utils.successResponse();
  } catch (err) {
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.updateWallet = utils.validateRequestBody(
  {
    username: "string",
    password: "string",
    value: "number",
  },
  utils.ensureUser(updateWallet)
);
