const base = require("./base");
const utils = require("../utils");

beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
});

describe("middleware", () => {
  describe("ensureUser", () => {
    it("authorizes the user correctly and assigns userObject property to event object", async () => {
      let successCallback = jest.fn();
      let middleware = utils.ensureUser(successCallback);
      await middleware({
        validatedKeys: {
          username: "andi",
          password: "blockchain",
        },
      });
      expect(successCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          userObject: expect.objectContaining({
            username: "andi",
            id: 0,
          }),
        })
      );
    });
    it("will not authorize with an incorrect password", async () => {
      let middleware = utils.ensureUser(() => {});
      let attempt = await middleware({
        validatedKeys: {
          username: "andi",
          password: "blockerchain",
        },
      });
      expect(attempt).toHaveProperty("statusCode", 401);
    });
    it("will not authorize nonexistent users", async () => {
      let middleware = utils.ensureUser(() => {});
      let attempt = await middleware({
        validatedKeys: {
          username: "andi500",
          password: "blockerchain",
        },
      });
      expect(attempt).toHaveProperty("statusCode", 404);
    });
  });
  describe("ensureProduct", () => {
    it("finds the product correctly and assigns productObject property to event object", async () => {
      let successCallback = jest.fn();
      let middleware = utils.ensureProduct(successCallback);
      await middleware({
        pathParameters: {
          distributor: "supermarket",
          id: 1,
        },
      });
      expect(successCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          productObject: expect.objectContaining({
            username: "supermarket",
            id: 1,
          }),
        })
      );
    });
    it("will not return nonexistent products", async () => {
      let middleware = utils.ensureProduct(() => {});
      let attempt = await middleware({
        pathParameters: {
          distributor: "supermarket",
          id: 100,
        },
      });
      expect(attempt).toHaveProperty("statusCode", 404);
    });
  });
  describe("validateRequestBody", () => {
    let successCallback = (event) => ({
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    });
    it("works for a string key", async () => {
      let validator = utils.validateRequestBody(
        { name: "string" },
        successCallback
      );
      expect(
        await validator({ body: JSON.stringify({ name: "andi" }) })
      ).toHaveProperty("statusCode", 200);
    });

    it("works for a number key", async () => {
      let validator = utils.validateRequestBody(
        { cash: "number" },
        successCallback
      );
      expect(
        await validator({ body: JSON.stringify({ cash: 25 }) })
      ).toHaveProperty("statusCode", 200);
    });
    it("works for a string and number key", async () => {
      let validator = utils.validateRequestBody(
        {
          name: "string",
          cash: "number",
        },
        successCallback
      );
      let validate = async (n, c) =>
        await validator({ body: JSON.stringify({ name: n, cash: c }) });
      expect(await validate(undefined, 20)).toHaveProperty("statusCode", 400);
      expect(await validate("andi", "20")).toHaveProperty("statusCode", 400);
      expect(await validate("andi", 20)).toHaveProperty("statusCode", 200);
    });
    it("works for function keys", async () => {
      let validator = utils.validateRequestBody(
        {
          specialNumber: (val) => val * 2 == 4,
          specialString: (val) => val.startsWith("hi"),
        },
        successCallback
      );
      let validate = async (n, s) =>
        await validator({
          body: JSON.stringify({ specialNumber: n, specialString: s }),
        });
      expect(await validate(1, "a")).toHaveProperty("statusCode", 400);
      expect(await validate(2, "a")).toHaveProperty("statusCode", 400);
      expect(await validate(2, "hi hello")).toHaveProperty("statusCode", 200);
    });
    it("fails when it's supposed to", async () => {
      let validator = utils.validateRequestBody(
        { cash: "number" },
        successCallback
      );
      expect(
        await validator({ body: JSON.stringify({ cash: "fifty" }) })
      ).toHaveProperty("statusCode", 400);
    });
    it("assigns validatedKeys property to event object", async () => {
      let successCallback = jest.fn();
      let validator = utils.validateRequestBody(
        { cash: "number" },
        successCallback
      );
      await validator({ body: JSON.stringify({ cash: 25 }) });
      expect(successCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          validatedKeys: expect.objectContaining({
            cash: 25,
          }),
        })
      );
    });
  });
});
