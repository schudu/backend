const mongoose = require("mongoose");

const Homework = require("./schemen/homework");
const School = require("./schemen/school");
const { Class, ClassRole } = require("./schemen/homework");
const { User, UserType, Languages } = require("./schemen/user");
const { EmailVerify, ResetPasswd } = require("./schemen/tokens");

module.exports = {
  Homework,
  School,
  User,
  UserType,
  Languages,
  Class,
  ClassRole,
  EmailVerify,
  ResetPasswd,
};
