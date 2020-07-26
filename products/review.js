"use strict";
const utils = require("../utils");

let reviewProduct = async (event) => {
  let { reviewerUsername, password, stars, text } = event.validatedKeys;
  let { username, id } = event.pathParameters;
  if ((await utils.authorizeUser(reviewerUsername, password)) == false)
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
      UpdateExpression: "SET #reviews = list_append(#reviews, :review)",
      ExpressionAttributeNames: {
        "#reviews": "reviews",
      },
      ExpressionAttributeValues: {
        ":review": [
          {
            reviewerUsername,
            stars,
            text,
            timestamp: +new Date(),
          },
        ],
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

module.exports.reviewProduct = utils.validateRequestBody(
  {
    reviewerUsername: "string",
    password: "string",
    stars: (val, body) => val >= 0 && val < 6,
    text: "string",
  },
  reviewProduct
);
