const utils = require("../utils");

let successCallback = (event) => ({
  statusCode: 200,
  body: JSON.stringify({ success: true }),
});

describe("request body validator", () => {
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
