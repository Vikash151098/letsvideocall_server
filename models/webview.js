const Joi = require("joi");
const mongoose = require("mongoose");

const webviewSchema = new mongoose.Schema({
  status: { type: String, enum: ["termsNConditions", "privacyPolicy", "support"] },
  text: String
});

const Webview = mongoose.model("Webview", webviewSchema);

function validateWebviewPost(webview) {
  const schema = {
    text: Joi.string(),
    status: Joi.string().valid(["termsNConditions", "privacyPolicy", "support"])
  };
  return Joi.validate(webview, schema);
}

function validateWebviewGet(webview) {
  const schema = {
    status: Joi.string().valid(["termsNConditions", "privacyPolicy", "support"])
  };
  return Joi.validate(webview, schema);
}

exports.Webview = Webview;
exports.validateWebviewPost = validateWebviewPost;
exports.validateWebviewGet = validateWebviewGet;
