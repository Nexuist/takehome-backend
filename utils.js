const AWS = require("aws-sdk");

let DynamoDocumentClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-10-08",
  region: "us-east-1",
});

let dynamo = async (action, params) =>
  await module.exports.DynamoDocumentClient[action]({
    TableName: "takehome",
    ...params,
  }).promise();

let customFailResponse = (reason, statusCode = 400) => ({
  statusCode,
  body: JSON.stringify({ success: false, reason }),
});

let validateRequestBody = (keys, callback) => {
  let failResponse = customFailResponse("Required keys are missing or invalid");
  return async (event) => {
    if (!event.body) return failResponse;
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      return failResponse;
    }
    for (key in keys) {
      if (!(key in body)) return failResponse;
      let desiredType = keys[key];
      let actualType = typeof body[key];
      if (actualType != desiredType) return failResponse;
    }
    event.validatedKeys = body;
    // everything checks out
    return callback(event);
  };
};

module.exports = {
  DynamoDocumentClient,
  dynamo,
  customFailResponse,
  validateRequestBody,
};
