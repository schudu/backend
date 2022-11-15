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
const axios = require("axios");

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
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://new.schudu.com",
    credentials: true,
  })
);
app.use("/auth", authRoute);

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/whoami", checkAuthenticated, async (req, res) => {
  req.user.password = null;
  res.send(req.user);
});

app.use("/user", checkAuthenticated, userRoute);

app.use("*", (req, res) => {
  res.status(404).send();
});

cron.schedule("* 0 * * *", () => {
  deleteold();
});

cron.schedule("0 6 * * *", () => {
  var endDate = new Date("11/03/2022");

  const images = [
    "https://cdn.pixabay.com/photo/2017/03/06/11/00/self-confidence-2121159_1280.jpg",
    "https://cdn.pixabay.com/photo/2016/06/03/08/18/just-do-it-1432951_1280.png",
    "https://cdn.pixabay.com/photo/2017/01/05/16/58/goal-setting-1955806_1280.png",
    "https://cdn.pixabay.com/photo/2016/06/03/08/18/do-it-now-1432945_1280.png",
    "https://cdn.pixabay.com/photo/2016/06/03/08/18/lets-do-it-1432952_1280.png",
    "https://cdn.pixabay.com/photo/2016/11/21/15/13/work-harder-1845901_1280.jpg",
    "https://cdn.pixabay.com/photo/2019/04/29/14/32/make-the-day-great-4166221_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/05/12/11/37/team-3393037_1280.jpg",
    "https://cdn.pixabay.com/photo/2017/01/28/12/20/do-not-give-up-2015253_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/11/27/21/44/take-it-easy-3842473_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/05/15/17/49/dont-give-up-3403779_1280.jpg",
  ];

  axios.post(process.env.SCHUDU_WEBHOOK, {
    content: null,
    embeds: [
      {
        title: "Keep working on me!",
        description:
          "Du willst diese App und Webapp nach den Herbstferien nutzen können. Also musst du etwas Gas geben!!!",
        color: 16711680,
        fields: [
          {
            name: "Time Left:",
            value:
              Math.round((endDate - new Date()) / (1000 * 60 * 60 * 24)) +
              " Days",
          },
        ],
        author: {
          name: "Schudu",
        },
        footer: {
          text: "Please Do It!!!",
        },
        image: {
          url: images[Math.floor(Math.random() * images.length)],
        },
      },
    ],
    attachments: [],
  });
});

app.listen(3001, () => {
  console.log("Schudu backend running on Port: 3001");
});
