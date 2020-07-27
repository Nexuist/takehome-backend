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
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify({ success: false, reason }),
});

let successResponse = (body) => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
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

let ensureUser = (callback) => async (event) => {
  let { username, password } = event.validatedKeys;
  let req = await dynamo("get", {
    Key: {
      username,
      id: 0,
    },
  });
  if (!req.Item) return customFailResponse("No such user exists", 404);
  let desiredPassword = req.Item.password;
  let actualPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  if (desiredPassword != actualPassword)
    return customFailResponse("Authorization failed", 401);
  event.userObject = req.Item;
  return callback(event);
};

let ensureProduct = (callback) => async (event) => {
  let { distributor, id } = event.pathParameters;
  if (parseInt(id) == NaN)
    return customFailResponse("id must be an integer", 400);
  let req = await dynamo("get", {
    Key: {
      username: distributor,
      id: +id,
    },
  });
  if (!req.Item) return customFailResponse("No such product exists", 404);
  event.productObject = req.Item;
  return callback(event);
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
  ensureUser,
  ensureProduct,
  deleteKey,
};
