const mongoose = require("mongoose");

const UserType = {
  TEACHER: "teacher",
  FUTURETEACHER: "futureteacher",
  STUDENT: "student",
};

const Languages = {
  EN: "en",
  DE: "de",
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
  birthday: {
    type: Date,
  },
  settings: {
    language: {
      type: String,
      default: "en",
      enum: Object.values(Languages),
      required: true,
    },
    notifications: {
      email: {
        homework: {
          correction: false,
          forgotten: false,
        },
      },
      mobile: {
        homework: {
          correction: false,
          forgotten: false,
        },
      },
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
