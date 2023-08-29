const express = require("express");

const classesSettingsRoute = require("./settings/classes");

const router = express.Router();

router.use("/classes", classesSettingsRoute);

module.exports = router;
