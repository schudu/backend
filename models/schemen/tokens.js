const mongoose = require("mongoose");

const emailVerifySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: 900,
    required: true,
  },
});

const changePasswordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: 300,
    required: true,
  },
});

const EmailVerify = mongoose.model("EmailVerify", emailVerifySchema);
const ResetPasswd = mongoose.model("ResetPasswd", changePasswordSchema);

module.exports = { EmailVerify, ResetPasswd };
