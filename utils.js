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

let createUser = async (name, password) => {
  await dynamo("put", {
    Item: {
      username: name,
      id: 0,
      password,
    },
  });
};

module.exports = {
  DynamoDocumentClient,
  dynamo,
  createUser,
};
