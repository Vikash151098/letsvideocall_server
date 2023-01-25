const express = require("express");
const config = require("config");
const users = require("../routes/users");
const auth = require("../routes/auth");
const admins = require("../routes/admins");
const dashboard = require("../routes/dashboard");
const s3upload = require("../routes/s3upload");
const otps = require("../routes/otps");
const cards = require("../routes/cards");
const webviews = require("../routes/webviews");
const stripeWebhook = require("../routes/stripeWebhook");
const appVersion = require("../routes/appVersion");
const reqLogger = require("../startup/logger");
const error = require("../middleware/error");
const chats = require("../routes/chats");
const notifications = require("../routes/notifications");

module.exports = function (app) {
  app.use(express.json());
  app.use(reqLogger);
  app.use("/api/admins", admins);
  app.use("/api/dashboard", dashboard);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/s3upload", s3upload);
  app.use("/api/otp", otps);
  app.use("/api/webview", webviews);
  app.use("/api/card", cards);
  app.use("/api/stripe", stripeWebhook);
  app.use("/api/version", appVersion);
  app.use("/api/chats", chats);
  app.use("/api/notifications", notifications);
  app.use("/", (req, res) => {
    res.send("Welcome to Memories App");
  });

  app.use(error);
};
