const express = require("express");
const mongoose = require("mongoose");

const { User, EmailVerify } = require("../models/shemas");

const router = express.Router();

router.put("/sendEmailverify", async (req, res) => {
  const { user } = req.body;

  await EmailVerify.deleteMany({ user: user._id });

  var emailVerification = new EmailVerify();
  emailVerification.user = user._id;

  var token = codeGenerate(6);

  while ((await EmailVerify.findOne({ token: token.toUpperCase() })) !== null) {
    token = codeGenerate(6);
  }

  emailVerification.token = token;

  await emailVerification.save();

  await sendEmail(
    user.email,
    "Verify your Email",
    `Hi ${user.username},\n\nThanks for Signing up and verifying your Email!\n\nThis is your verification code: ${token}\n\nThis code will onlx be valid for the next 5 minutes. If the code does not work, you can request a new one here:\nhttps://linkhub.kessaft.tk/login\n\nThanks!\nYour Linkhub Expert`,
    null
    // await ejs.renderFile("./app/components/emails/emailVerify.ejs", {
    //   code: token.split(""),
    //   username: user.username,
    // })
  );

  return res.send();
});

router.put("/emailverify/:code", async (req, res) => {
  if (!req.params.code.matches(/^[ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{6}$/i))
    return res.status(415).send();

  const emailVerify = await EmailVerify.findOneAndDelete({
    code: req.body.code.toUpperCase(),
    user: req.user._id,
  });

  if (!emailVerify) return res.status(401).send("You need to Login");

  await User.findById(req.user._id, { emailVerified: true });

  return res.send();
});

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
