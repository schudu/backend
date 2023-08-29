const express = require("express");
const mongoose = require("mongoose");
const { User, Class, School } = require("../../../models/shemas");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, school } = req.body;
  if (
    !name ||
    typeof name !== "string" ||
    !school ||
    !mongoose.Types.ObjectId.isValid(school)
  )
    return res.status(400).send();

  if (
    await Class.exists({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    })
  )
    return res.status(409).send("name");
  else if (await School.exists({ _id: mongoose.Types.ObjectId(school) }))
    return res.status(409).send("school");

  await Class.create({
    name: name.trim(),
    school: mongoose.Types.ObjectId(school),
  });

  res.send();
});

router.post("/name", async (req, res) => {
  if (!req.query.name || typeof req.query.name !== "string")
    return res.status(400).send();

  res.send(
    await Class.exists({
      name: { $regex: `^${req.query.name.trim()}$`, $options: "i" },
    })
  );
});

router.get("/schools", async (req, res) => {
  res.send(await School.find());
});

router.post("/school", async (req, res) => {
  const { name, country, city, plz, timezone, avatar } = req.body;
  if (
    !name ||
    !country ||
    !city ||
    !timezone ||
    typeof name !== "string" ||
    typeof country !== "string" ||
    typeof city !== "string" ||
    typeof timezone !== "number" ||
    (plz && typeof plz !== "number")
  )
    return res.status(400).send();

  if (
    await School.exists({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      country: { $regex: `^${country.trim()}$`, $options: "i" },
      city: { $regex: `^${city.trim()}$`, $options: "i" },
      plz,
    })
  )
    return res.status(409).send();

  await School.create({
    name: name.trim(),
    country: country.trim(),
    city: city.trim(),
    plz,
    timezone,
  });

  res.send(await School.find());
});

module.exports = router;
