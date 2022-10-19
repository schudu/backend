if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const { Homework, User, ResetPasswd, UserType } = require("./models/shemas");
const connection = require("./services/db");
const sendEmail = require("./services/emailer");
const TypeCheck = require("./services/typeCheck");

const userRoute = require("./routes/user");

const app = express();

(async () => await connection())();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/whoami", checkAuthenticated, async (req, res) => {
  res.send(req.user);
});

app.post("/login", checkNotAuthenticated, async (req, res) => {
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

app.post("/register", checkNotAuthenticated, async (req, res) => {
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
  } = req.body;

  if (typeof type !== "string") return res.status(415).send();

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

app.get("/resetpassword", checkNotAuthenticated, async (req, res) => {
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

app.get("/resetpassword/:id", async (req, res) => {
  const passwordReset = await ResetPasswd.findById(req.params.id);

  if (!passwordReset)
    return res.status(400).send({ where: "id", error: "invalid" });

  return res.send();
});

app.put("/resetpassword/:id", async (req, res) => {
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

async function checkAuthenticated(req, res, next) {
  const auth = await checkJWT(req.cookies.token);

  if (auth === 500) return res.status(500).send();

  if (!auth) return res.status(401).send();

  req.user = auth;
  return next();
}

async function checkNotAuthenticated(req, res, next) {
  const auth = await checkJWT(req.cookies.token);

  if (auth === 500) return res.status(500).send();

  if (auth) return res.status(401).send();

  return next();
}

async function checkJWT(token) {
  try {
    if (!token) return false;

    var decoded = jwt.decode(token);

    if (!decoded || !decoded.id || typeof decoded.id !== "string") return false;

    const user = await User.findById(decoded.id).lean();

    if (!user) return false;

    const authData = jwt.verify(token.toString(), user.password);

    if (!authData) return false;

    /* if (user.emailVerified) {
      user.emailVerified = (await EmailVerify.exists({
        user: mongoose.Types.ObjectId(decoded.id),
      }))
        ? false
        : true;
    } */

    return user;
  } catch (err) {
    console.log(err);
    return 500;
  }
}

app.use("/user", checkAuthenticated, userRoute);

app.use("*", (req, res) => {
  res.status(404).send();
});

cron.schedule("* 0 * * *", function () {
  deleteold();
});

app.listen(3001, () => {
  console.log("Schudu backend running on Port: 3001");
});
