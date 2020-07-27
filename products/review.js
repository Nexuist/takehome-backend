"use strict";
const utils = require("../utils");

let reviewProduct = async (event) => {
  console.log("made it this far!!");
  let { stars, text } = event.validatedKeys;
  let reviewer = event.userObject;
  let product = event.productObject;
  try {
    await utils.dynamo("update", {
      Key: {
        username: product.username,
        id: product.id,
      },
      UpdateExpression: "SET #reviews = list_append(#reviews, :review)",
      ExpressionAttributeNames: {
        "#reviews": "reviews",
      },
      ExpressionAttributeValues: {
        ":review": [
          {
            reviewerUsername: reviewer.username,
            stars,
            text,
            timestamp: +new Date(),
          },
        ],
      },
    });
    return utils.successResponse();
  } catch (err) {
    return utils.customFailResponse("Server error", 500);
  }
};

module.exports.reviewProduct = utils.validateRequestBody(
  {
    username: "string",
    password: "string",
    stars: (val, body) => val >= 0 && val < 6,
    text: "string",
  },
  utils.ensureUser(utils.ensureProduct(reviewProduct))
);
