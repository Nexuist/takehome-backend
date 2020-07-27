"use strict";
const crypto = require("crypto");
const utils = require("../utils");

let getUser = async (event) => {
  let user = event.userObject;
  delete user.password;
  return utils.successResponse(user);
};

module.exports.getUser = utils.validateRequestBody(
  {
    username: "string",
    password: "string",
  },
  utils.ensureUser(getUser)
);
