"use strict";
const crypto = require("crypto");
const utils = require("../utils");

let signup = async (event) => {
  let { username, email, password } = event.validatedKeys;
  // NOTE: it's debatable whether SHA-256 is a good password hashing algorithm, but this is a tech demo anyways
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  try {
    await utils.dynamo("put", {
      Item: {
        username,
        id: 0,
        password: hashedPassword,
        email,
        wallet: 0,
        isDistributor: false,
      },
      ConditionExpression: "attribute_not_exists(username)",
    });
    return utils.successResponse();
  } catch (err) {
    if (err.code == "ConditionalCheckFailedException")
      return utils.customFailResponse("Username is taken", 400);
    return utils.customFailResponse("Server error");
  }
};

module.exports.signup = utils.validateRequestBody(
  {
    username: "string",
    email: "string",
    password: "string",
  },
  signup
);
