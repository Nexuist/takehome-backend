const AWS = require("aws-sdk");
const utils = require("../utils");
const handler = require("../users/signup");

const DynamoParams = {
  apiVersion: "2012-10-08",
  region: "us-east-1",
  endpoint: "http://localhost:8000",
};
const DDB = new AWS.DynamoDB(DynamoParams);
const DDC = new AWS.DynamoDB.DocumentClient(DynamoParams);

// prevent any requests from hitting prod
beforeAll(() => {
  utils.DynamoDocumentClient = DDC;
});

describe("signup", () => {
  it("can create a user account", async () => {
    expect(await handler.signup("boo", "boo2")).toEqual(
      expect.objectContaining({ statusCode: 200 })
    );
  });
});
