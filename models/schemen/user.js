const mongoose = require("mongoose");

const UserType = {
  TEACHER: "teacher",
  FUTURETEACHER: "futureteacher",
  STUDENT: "student",
};

const Languages = {
  EN: "English",
  DE: "Deutsch",
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(UserType),
    default: "student",
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    data: Buffer,
    contentType: String,
  },
  settings: {
    language: {
      type: String,
      default: "EN",
      enum: Object.values(Languages),
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastActive: {
    type: Date,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = { User, UserType, Languages };
