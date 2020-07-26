const AWS = require("aws-sdk");
const crypto = require("crypto");

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

let successResponse = (body) => ({
  statusCode: 200,
  body: JSON.stringify({ success: true, ...body }),
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
      if (typeof desiredType == "function") {
        // if the given type is a function use it to validate the body key
        let validator = desiredType;
        // provide the entire body object as context for the validator
        let result = validator(body[key], body);
        if (result == false) return failResponse;
      } else {
        if (actualType != desiredType) return failResponse;
      }
    }
    event.validatedKeys = body;
    // everything checks out
    return callback(event);
  };
};

let authorizeUser = async (username, password) => {
  let req = await dynamo("get", {
    Key: {
      username,
      id: 0,
    },
  });
  if (!req.Item) return false; // no such user exists
  let desiredPassword = req.Item.password;
  let actualPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  return desiredPassword == actualPassword;
};

// For testing only
let deleteKey = async (username, id) =>
  await dynamo("delete", {
    Key: { username, id },
  });

module.exports = {
  DynamoDocumentClient,
  dynamo,
  customFailResponse,
  successResponse,
  validateRequestBody,
  authorizeUser,
  deleteKey,
};
