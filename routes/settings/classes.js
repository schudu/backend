const express = require("express");

const newSettingsRoute = require("./classes/new");

const router = express.Router();

router.use("/new", newSettingsRoute);

module.exports = router;
