const mongoose = require("mongoose");

const ClassRole = {
  OWNER: "owner",
  ADMIN: "admin",
  CLASSREPRESENTATIVE: "ClassRepresentative",
  TEACHER: "teacher",
  STUDENT: "student",
  READONLY: "readonly",
  COSTUM: "costum",
};

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    data: Buffer,
    contentType: String,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  users: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: Object.values(ClassRole),
        default: "student",
      },
      permissions: {
        kickUsers: {
          type: boolean,
          default: false,
        },
        editHomeworks: {
          type: boolean,
          default: false,
        },
        createHomeworks: {
          type: boolean,
          default: true,
        },
        editSubjects: {
          type: boolean,
          default: false,
        },
        inviteUsers: {
          type: boolean,
          default: false,
        },
        kickUsers: {
          type: boolean,
          default: false,
        },
        enterStats: {
          type: boolean,
          default: true,
        },
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastActive: {
    type: Date,
  },
});

const Class = mongoose.model("Class", classSchema);

module.exports = { Class, ClassRole };
