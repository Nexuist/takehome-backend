const base = require("./base");
const utils = require("../utils");

let handler = require("../products/review");

let call = async (json, pathParameters) =>
  await handler.reviewProduct({
    body: JSON.stringify(json),
    pathParameters,
  });

beforeAll(async () => {
  utils.DynamoDocumentClient = base.DDC;
});

describe("review a product", () => {
  it("can review a product", async () => {
    let attempt = await call(
      {
        reviewerUsername: "andi",
        password: "blockchain",
        text: "a good review",
        stars: 3,
      },
      {
        username: "supermarket",
        id: 1,
      }
    );
    expect(attempt).toHaveProperty("statusCode", 200);
    let product = await utils.dynamo("get", {
      Key: {
        username: "supermarket",
        id: 1,
      },
    });
    expect(product.Item.reviews.length).toBeGreaterThanOrEqual(2);
  });
  it("won't let you review a non-existent product", async () => {
    expect(
      await call(
        {
          reviewerUsername: "andi",
          password: "blockchain",
          text: "a good review",
          stars: 3,
        },
        { username: "supermarket", id: 5 }
      )
    ).toHaveProperty("statusCode", 400);
  });
});
