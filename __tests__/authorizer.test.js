const AWS = require("aws-sdk");
const utils = require("../utils");

const DynamoParams = {
  apiVersion: "2012-10-08",
  region: "us-east-1",
  endpoint: "http://localhost:8000",
};
const DDB = new AWS.DynamoDB(DynamoParams);
const DDC = new AWS.DynamoDB.DocumentClient(DynamoParams);

beforeAll(async () => {
  utils.DynamoDocumentClient = DDC;
});

describe("user authenticator", () => {
  it("authorizes the user correctly", async () => {
    expect(await utils.authorizeUser("andi", "blockchain")).toBeTruthy();
  });
  it("will not authorize with an incorrect password", async () => {
    expect(await utils.authorizeUser("andi", "blockerchain")).toBeFalsy();
  });
  it("will not authorize nonexistent users", async () => {
    expect(await utils.authorizeUser("andi500", "blockchain")).toBeFalsy();
  });
});
