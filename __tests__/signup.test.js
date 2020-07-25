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

let call = async (json) => await handler.signup({ body: JSON.stringify(json) });

// prevent any requests from hitting prod
// delete any keys belonging to these tests
beforeAll(async () => {
  utils.DynamoDocumentClient = DDC;
  await utils.dynamo("delete", {
    Key: {
      username: "andi2",
      id: 0,
    },
  });
  await utils.dynamo("delete", {
    Key: {
      username: "andi3",
      id: 0,
    },
  });
});

describe("signup", () => {
  it("can create a user account", async () => {
    expect(
      await call({
        username: "andi2",
        email: "test@test.com",
        password: "blockchain",
      })
    ).toEqual(expect.objectContaining({ statusCode: 200 }));
    let item = await utils.dynamo("get", {
      Key: {
        username: "andi2",
        id: 0,
      },
    });
    expect(item).toHaveProperty("Item", expect.any(Object));
  });
  it("will not store the password unhashed", async () => {
    expect(
      await call({
        username: "andi3",
        email: "test@test.com",
        password: "blockchain",
      })
    ).toEqual(expect.objectContaining({ statusCode: 200 }));
    let item = await utils.dynamo("get", {
      Key: {
        username: "andi2",
        id: 0,
      },
    });
    expect(item).toHaveProperty(
      "Item.password",
      expect.not.stringMatching("blockchain")
    );
  });
  it("will not allow new accounts with existing usernames", async () => {
    expect(
      await call({
        username: "andi3",
        email: "test@test.com",
        password: "blockchain",
      })
    ).toEqual(expect.objectContaining({ statusCode: 400 }));
  });
});
