const Joi = require("joi");
const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema({
  major: Number,
  minor: Number,
  patch: Number,
  appType: { type: String, enum: ["android", "ios"] },
  androidMessage: String,
  iosMessage: String,
  androidMessageOptional: String,
  iosMessageOptional: String,
  updateType: { type: String, enum: ["major", "minor", "patch"], default: "major" },
  creationDate: {
    type: Date,
    default: () => {
      return new Date();
    }
  },
  insertDate: {
    type: Number,
    default: () => {
      return Math.round(new Date() / 1000);
    }
  }
});

const Version = mongoose.model("version", appVersionSchema);

function validateAppVersionPost(version) {
  const schema = {
    major: Joi.number().required(),
    minor: Joi.number().required(),
    patch: Joi.number().required(),
    appType: Joi.string().valid(["android", "ios"]).required(),
    androidMessage: Joi.string().required(),
    iosMessage: Joi.string().required(),
    androidMessageOptional: Joi.string().required(),
    iosMessageOptional: Joi.string().required(),
    updateType: Joi.string().valid(["major", "minor", "patch"]).required()
  };
  return Joi.validate(version, schema);
}

function validateAppVersionCheckPost(version) {
  const schema = {
    major: Joi.number().required(),
    minor: Joi.number().required(),
    patch: Joi.number().required(),
    appType: Joi.string().valid(["android", "ios"]).required()
  };
  return Joi.validate(version, schema);
}

exports.Version = Version;
exports.validateAppVersionPost = validateAppVersionPost;
exports.validateAppVersionCheckPost = validateAppVersionCheckPost;
