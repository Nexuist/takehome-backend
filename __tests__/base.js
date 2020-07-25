// Prevent any DynamoDB requests from hitting the actual prod endpoint during tests

const AWS = require("aws-sdk");

const DynamoParams = {
  apiVersion: "2012-10-08",
  region: "us-east-1",
  endpoint: "http://localhost:8000",
};
const DDB = new AWS.DynamoDB(DynamoParams);
const DDC = new AWS.DynamoDB.DocumentClient(DynamoParams);

module.exports.DDC = DDC;
