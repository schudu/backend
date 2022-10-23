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
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./services/authcheck");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");

const app = express();

connection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development" ? "*" : "https://new.schudu.com",
  })
);
app.use("/auth", authRoute);

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/whoami", checkAuthenticated, async (req, res) => {
  res.send(req.user);
});

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
