const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});
const UserSchema = new mongoose.Schema({
  userType: { type: String, enum: ["app", "facebook", "google", "apple"] },
  fullName: { type: String, default: "" },
  email: { type: String, default: "-", required: true, unique: true },
  password: { type: String, default: "" },
  deviceToken: { type: String, default: "" },
  version: { type: String, default: "" },
  facebookId: { type: String, default: "" },
  googleId: { type: String, default: "" },
  appleId: { type: String, default: "" },
  accessToken: { type: String, default: "" },
  status: {
    type: String,
    enum: ["active", "inactive", "blocked", "suspended", "deleted"],
  },
  profilePic: { type: String, default: "" },
  // coverImage: { type: String, default: "" },
  locationPoint: { type: pointSchema },
  location: { lat: Number, lng: Number },
  locationName: String,
  isReported: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
  referralCode: { type: String, default: "" },
  referredBy: { type: String, default: "" },
  totalReferral: { type: Number, default: 0 },
  socketId: String,
  isOnline: Boolean,
  lastSeen: Date,
  creationDate: {
    type: Date,
    default: () => {
      return new Date();
    },
  },
  insertDate: {
    type: Number,
    default: () => {
      return Math.round(new Date() / 1000);
    },
  },
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      userId: this._id,
      role: "user",
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

UserSchema.methods.createReferralCode = async function () {
  let referralCode =
    this.fullName.substr(0, 3).toLowerCase() +
    Math.floor(Math.random() * 90000 + 10000);
  let loop = true;
  while (loop) {
    let found = await User.findOne({ referralCode: referralCode });
    if (!found) {
      loop = false;
    } else {
      referralCode =
        this.firstName
          .substr(0, 7)
          .toLowerCase()
          .replace(" ", "")
          .substr(0, 3) + Math.floor(Math.random() * 90000 + 10000);
    }
  }
  return referralCode;
};

UserSchema.index({ locationPoint: "2dsphere" });
const User = mongoose.model("User", UserSchema);

function validateUserPost(user) {
  const schema = {
    userType: Joi.string().valid(["app", "google", "facebook"]).required(),
    fullName: Joi.string().min(1).max(200).required(),
    password: Joi.string().min(6).max(20).required(),
    email: Joi.string().email().required(),
    version: Joi.string(),
    deviceToken: Joi.string().min(1).max(200).required(),
    profilePic: Joi.string().min(1).max(300).allow(""),
    otpToken: Joi.number().required(),
  };
  return Joi.validate(user, schema);
}

function validateUserPut(user) {
  const schema = {
    userId: Joi.string().min(1).max(200),
    fullName: Joi.string().min(1).max(200),
    email: Joi.string().email(),
    otpToken: Joi.number(),
    version: Joi.string(),
    deviceToken: Joi.string().min(1).max(200),
    profilePic: Joi.string().min(1).max(200).allow(""),
    status: Joi.string().valid(["active", "inactive", "blocked", "suspended"]),
  };
  return Joi.validate(user, schema);
}

function validateUserListGet(user) {
  const schema = {
    userName: Joi.string().min(1).max(100),
    email: Joi.string().email(),
    startDate: Joi.string(),
    endDate: Joi.string(),
    status: Joi.any().valid(["active", "blocked", "suspended"]),
  };
  return Joi.validate(user, schema);
}

function userProjection() {
  return {
    _id: 0,
    userId: "$_id",
    fullName: 1,
    email: 1,
    userType: 1,
    status: 1,
    profilePic: 1,
    insertDate: 1,
    isReported: 1,
    reportCount: 1,
    totalStatusPoint: 1,
  };
}

module.exports.User = User;
module.exports.validateUserPost = validateUserPost;
module.exports.validateUserPut = validateUserPut;
module.exports.validateUserListGet = validateUserListGet;
module.exports.userProjection = userProjection;
