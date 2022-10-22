const express = require("express");
const mongoose = require("mongoose");

const { User, EmailVerify } = require("../models/shemas");

const router = express.Router();

module.exports = router;

function codeGenerate(count) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  var result = "";
  for (var i = 0; i < count; i++) {
    var x = Math.floor(Math.random() * chars.length);
    result += chars[x];
  }
  return result;
}
