const mongoose = require("mongoose");

const Homework = require("./schemen/homework");
const { Class, ClassRole } = require("./schemen/homework");
const { User, UserType } = require("./schemen/user");
const { EmailVerify, ResetPasswd } = require("./schemen/tokens");

module.exports = {
  Homework,
  User,
  UserType,
  Class,
  ClassRole,
  EmailVerify,
  ResetPasswd,
};
