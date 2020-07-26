const base = require("./base");
const utils = require("../utils");
const handler = require("../users/signup");

let call = async (json) => await handler.signup({ body: JSON.stringify(json) });

// delete any keys belonging to these tests
beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
  await utils.deleteKey("andi2", 0);
  await utils.deleteKey("andi3", 0);
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
