const base = require("./base");
const utils = require("../utils");

beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
});

describe.skip("user authenticator", () => {
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
