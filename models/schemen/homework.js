const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  files: [
    {
      type: String,
    },
  ],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    rel: "Class",
    required: true,
  },
  expire: {
    type: Date,
    required: true,
  },
  done: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  ],
  createdAt: {
    type: Date,
    default: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    ),
  },
  creator: {
    type: String,
  },
  files: {
    id: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
  },
  stats: {
    average: {
      duration: [
        {
          type: Number,
        },
      ],
      difficulty: [
        {
          type: Number,
        },
      ],
    },
  },
});

const Homework = mongoose.model("Homework", homeworkSchema);

module.exports = Homework;
