const AWS = require("aws-sdk");
const utils = require("../utils");

const DynamoParams = {
  apiVersion: "2012-10-08",
  region: "us-east-1",
  endpoint: "http://localhost:8000",
};
const DDB = new AWS.DynamoDB(DynamoParams);
const DDC = new AWS.DynamoDB.DocumentClient(DynamoParams);

let handler = require("../users/wallet");

let call = async (json, pathParameters) =>
  await handler.updateWallet({
    body: JSON.stringify(json),
    pathParameters,
  });

beforeAll(async () => {
  utils.DynamoDocumentClient = DDC;
});

describe("wallet update", () => {
  it("updates the wallet value", async () => {
    let attempt = await call(
      {
        password: "blockchain",
        value: 500,
      },
      { username: "andi" }
    );
    expect(attempt).toHaveProperty("statusCode", 200);
  });
});
