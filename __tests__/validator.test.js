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
