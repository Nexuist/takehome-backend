"use strict";

let utils = require("../utils");

module.exports.signup = async (event) => {
  await utils.createUser("boo", "pfeiffer");
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
      },
      null,
      2
    ),
  };
};
