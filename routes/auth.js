const express = require("express");
const mongoose = require("mongoose");

const { User, EmailVerify } = require("../models/shemas");

const { checkAuthenticated, checkNotAuthenticated } = require("../server");
const sendEmail = require("../services/emailer");
const TypeCheck = require("../services/typeCheck");

const router = express.Router();

router.post("/login", async (req, res) => {
  if (new TypeCheck(req.body.password).isPassword())
    return res.status(400).send();

  const { account, password, remember } = req.body;

  if (typeof account !== "string") return res.status(415).send();

  const user = await User.findOne({
    $or: [{ email: account.toLowerCase() }, { username: account }],
  });

  if (!user) return res.status(401).send();

  if (await bcrypt.compare(password, user.password)) {
    return res
      .cookie(
        "token",
        jwt.sign(
          { id: user._id },
          user.password,
          !!remember
            ? {}
            : {
                expiresIn: 60 * 60 * 24,
              }
        ),
        !!remember ? {} : { maxAge: 60 * 60 * 24 }
      )
      .send({ emailVerified: user.emailVerified });
  }
  return res.status(401).send();
});

router.post("/register", async (req, res) => {
  let error = [];
  error.push(new TypeCheck(req.body.firstname).isName("firstname"));
  error.push(new TypeCheck(req.body.lastname).isName("lastname"));
  error.push(new TypeCheck(req.body.password).isPassword());
  error.push(new TypeCheck(req.body.email).isEmail());
  error.push(new TypeCheck(req.body.username).isUsername());

  error = error.filter((e) => e != null);

  if (error.length) return res.status(400).send(error);

  const {
    username,
    email,
    password,
    firstname,
    lastname,
    type = "student",
    language = "EN",
  } = req.body;

  if (typeof type !== "string" || typeof language != "string")
    return res.status(415).send();

  if (await User.exists({ username: username }))
    return res.status(409).send({ where: "username", error: "used" });
  else if (await User.exists({ email: email.toLowerCase() }))
    return res.status(409).send({ where: "email", error: "used" });

  try {
    await bcrypt.hash(password, 10, async function (err, hash) {
      const user = await User.create({
        firstname,
        lastname,
        username,
        email: email.toLowerCase(),
        password: hash,
        type: type === "teacher" ? UserType.FUTURETEACHER : UserType.STUDENT,
        settings: {
          language: Object.keys(Languages).includes(language.toUpperCase())
            ? language.toUpperCase()
            : "EN",
        },
      });

      res
        .cookie(
          "token",
          jwt.sign({ id: user._id }, user.password, {
            expiresIn: 60 * 60 * 24,
          }),
          { maxAge: 60 * 60 * 24 }
        )
        .status(201)
        .send();
    });
  } catch {
    return res.status(500).send();
  }
});

router.get("/resetpassword", async (req, res) => {
  let error = new TypeCheck(req.query.email).isEmail();

  if (error) return res.status(400).send(error);

  const user = await User.findOne({ email: req.query.email });

  if (!user) return res.send();

  const passwordReset = await ResetPasswd.create({
    user: user._id,
  });

  return res.send(passwordReset._id);
  await sendEmail(
    user.email,
    "Reset your Password",
    `Hi ${user.username},\n\nMaybe you should remember the next Password a little better 😜.\n\nClick the Button below to set a new Password:\nhttps://new.schudu.com/resetpassword/${passwordReset._id}\nThis Link will expire in 10 minutes, so be quick! \n\nIf this has nothing to do with you, please just ignore this!\n\nThanks!\nYour Schudu Expert`,
    null
    // await ejs.renderFile("./app/components/emails/changePassword.ejs", {
    //   resetId: passwordReset._id,
    //   username: user.username,
    // })
  );

  return res.send();
});

router.get("/resetpassword/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send({ where: "id", error: "invalid" });

  const passwordReset = await ResetPasswd.findById(req.params.id);

  if (!passwordReset)
    return res.status(400).send({ where: "id", error: "invalid" });

  return res.send();
});

router.put("/resetpassword/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send({ where: "id", error: "invalid" });

  let error = new TypeCheck(req.body.password).isPassword();

  if (error) return res.status(400).send(error);

  const passwordReset = await ResetPasswd.findById(req.params.id);

  if (!passwordReset)
    return res.status(400).send({ where: "id", error: "invalid" });

  await bcrypt.hash(req.body.password, 10, async function (err, hash) {
    await User.findByIdAndUpdate(passwordReset.user, {
      password: hash,
    });
  });

  await ResetPasswd.findByIdAndDelete(passwordReset._id);

  const user = await User.findById(passwordReset.user);

  await sendEmail(
    user.email,
    "Password successful reseted",
    `Hi ${user.username},\n\nYour Password has successfully been reseted. 👍\n\nMake soure to not forget it again 🤨\n\nThanks!\nYour Linkhub Expert`,
    null
    // await ejs.renderFile("./app/components/emails/changePassword.ejs", {
    //   resetId: passwordReset._id,
    //   username: user.username,
    // })
  );

  return res.send();
});

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
