const { VERSION_CONSTANT } = require("../config/constant.js");
const config = require("config");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const _ = require("lodash");
const { User } = require("../models/user");
const {
  Version,
  validateAppVersionPost,
  validateAppVersionCheckPost,
} = require("../models/appVersion");

router.post("/", adminAuth, async (req, res) => {
  const { error } = validateAppVersionPost(req.body);
  if (error)
    return res
      .status(400)
      .send({
        statusCode: 400,
        message: "Failure",
        data: error.details[0].message,
      });

  let version = new Version(
    _.pick(req.body, [
      "major",
      "minor",
      "patch",
      "appType",
      "androidMessage",
      "iosMessage",
      "iosMessageOptional",
      "androidMessageOptional",
      "updateType",
    ])
  );
  await version.save();
  return res.send({
    statusCode: 200,
    message: "Success",
    data: VERSION_CONSTANT.SUBMIT_SUCCESS,
  });
});

router.get("/check", async (req, res) => {
  if (!req.query.v) {
    return res.send({
      statusCode: 200,
      message: "Success",
      data: {
        optionalUpdate: false,
        forceUpdate: false,
        message: VERSION_CONSTANT.VERSION_MANDATORY,
      },
    });
  } else if (!req.query.appType) {
    return res.send({
      statusCode: 200,
      message: "Success",
      data: {
        optionalUpdate: false,
        forceUpdate: false,
        message: VERSION_CONSTANT.APPTYPE_MANDATORY,
      },
    });
  }

  let versionArray = req.query.v.split(".");

  let major = 0;
  let minor = 0;
  let patch = 0;
  if (versionArray[0]) major = parseInt(versionArray[0]);
  if (versionArray[1]) minor = parseInt(versionArray[1]);
  if (versionArray[1]) patch = parseInt(versionArray[2]);

  if (isNaN(major))
    return res.send({
      statusCode: 200,
      message: "Success",
      data: {
        optionalUpdate: false,
        forceUpdate: false,
        message: VERSION_CONSTANT.NO_UPDATE,
      },
    });
  else if (isNaN(minor))
    return res.send({
      statusCode: 200,
      message: "Success",
      data: {
        optionalUpdate: false,
        forceUpdate: false,
        message: VERSION_CONSTANT.NO_UPDATE,
      },
    });
  else if (isNaN(patch)) {
    return res.send({
      statusCode: 200,
      message: "Success",
      data: {
        optionalUpdate: false,
        forceUpdate: false,
        message: VERSION_CONSTANT.NO_UPDATE,
      },
    });
  }

  let flag = 0; // Flag 1 -> mandatory . Flag 2 -> Recommended.
  let latestVersionList = await Version.aggregate([
    { $match: { appType: req.query.appType } },
    { $sort: { insertDate: -1 } },
    { $limit: 1 },
  ]);

  if (!latestVersionList.length) {
    return res.send({
      statusCode: 200,
      message: "Success",
      data: {
        optionalUpdate: false,
        forceUpdate: false,
        message: VERSION_CONSTANT.NO_UPDATE,
      },
    });
  }

  let latestVersion = latestVersionList[0];

  // console.log("Major: ", major, latestVersion.major);
  // console.log("Minor: ", minor, latestVersion.minor);
  // console.log("Patch: ", patch, latestVersion.patch);

  if (major < latestVersion.major) {
    flag = 1;
  } else if (minor < latestVersion.minor) {
    if (
      latestVersion.updateType == "minor" ||
      latestVersion.updateType == "patch"
    ) {
      flag = 1;
    } else {
      flag = 2;
    }
  } else if (patch < latestVersion.patch) {
    if (latestVersion.updateType == "patch") {
      flag = 1;
    } else {
      flag = 2;
    }
  }

  if (flag == 1) {
    let userMessage =
      req.query.appType == "ios"
        ? latestVersion.iosMessage
        : latestVersion.androidMessage;
    return res.send({
      statusCode: 200,
      message: "Success",
      data: { optionalUpdate: false, forceUpdate: true, message: userMessage },
    });
  }
  if (flag == 2) {
    let userMessage =
      req.query.appType == "ios"
        ? latestVersion.iosMessageOptional
        : latestVersion.androidMessageOptional;
    return res.send({
      statusCode: 200,
      message: "Success",
      data: { optionalUpdate: true, forceUpdate: false, message: userMessage },
    });
  }

  return res.send({
    statusCode: 200,
    message: "Success",
    data: {
      optionalUpdate: false,
      forceUpdate: false,
      message: VERSION_CONSTANT.NO_UPDATE,
    },
  });
});

module.exports = router;
