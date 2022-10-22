if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const {
  Homework,
  User,
  ResetPasswd,
  UserType,
  Languages,
} = require("./models/shemas");
const connection = require("./services/db");
const sendEmail = require("./services/emailer");
const TypeCheck = require("./services/typeCheck");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");

const app = express();

(async () => await connection())();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development" ? "*" : "https://new.schudu.com",
  })
);

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/whoami", checkAuthenticated, async (req, res) => {
  res.send(req.user);
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
app.use("/auth", authRoute);

app.use("*", (req, res) => {
  res.status(404).send();
});

cron.schedule("* 0 * * *", function () {
  deleteold();
});

app.listen(3001, () => {
  console.log("Schudu backend running on Port: 3001");
});
