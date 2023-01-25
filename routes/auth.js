const { AUTH_CONSTANTS } = require("../config/constant.js");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const { userAuth, providerAuth } = require("../middleware/auth");
const { Otp, verifyAndDeleteToken } = require("../models/otp");
const express = require("express");
const router = express.Router();

//login
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: error.details[0].message,
    });

  let criteria = {};
  if (req.body.email && req.body.email != "")
    criteria.email = req.body.email.toLowerCase();
  if (req.body.mobile && req.body.mobile != "")
    criteria.mobile = req.body.mobile.toLowerCase();

  let user = await User.findOne(criteria);
  if (!user) {
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: AUTH_CONSTANTS.INVALID_CREDENTIALS,
    });
  }

  if (user.status === "deleted")
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: AUTH_CONSTANTS.DELETED_ACCOUNT,
      status: user.status,
    });

  if (user.status != "active")
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: AUTH_CONSTANTS.INACTIVE_ACCOUNT,
      status: user.status,
    });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: AUTH_CONSTANTS.INVALID_CREDENTIALS,
    });

  const token = user.generateAuthToken();
  user.accessToken = token;
  user.deviceToken = req.body.deviceToken;
  if (req.body.deviceToken)
    await User.updateMany(
      { deviceToken: req.body.deviceToken, email: { $ne: user.email } },
      { $set: { deviceToken: "" } }
    );

  await user.save();
  user.userId = user._id;

  let response = _.pick(user, [
    "userId",
    "fullName",
    "email",
    "status",
    "profilePic",
    "userType",
    "insertDate",
  ]);

  res
    .header("Authorization", token)
    .send({ statusCode: 200, message: "Success", data: response });
});

router.post("/social/login", async (req, res) => {
  const { error } = validateUserSocialPost(req.body);
  if (error)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: error.details[0].message,
    });

  // Just in case email/username is null
  var mobile = "NA";
  if (req.body.email && req.body.email != "")
    var email = req.body.email.toLowerCase() || "NMB";
  if (req.body.mobile && req.body.mobile != "") {
    mobile = req.body.mobile.toLowerCase();
  }

  let criteria = {},
    user;
  if (req.body.userType == "facebook")
    criteria.facebookId = req.body.facebookId;
  if (req.body.userType == "google") criteria.googleId = req.body.googleId;

  if (req.body.userType != "apple") {
    user = await User.findOne().or([{ mobile: mobile }, { email: email }]);
  } else {
    user = await User.findOne({ appleId: req.body.appleId });
  }

  if (user && user.status !== "deleted") {
    if (user.status === "deleted")
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: AUTH_CONSTANTS.DELETED_ACCOUNT,
      });

    if (user.status != "active")
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: AUTH_CONSTANTS.INACTIVE_ACCOUNT,
      });

    const token = user.generateAuthToken();
    user.accessToken = token;
    user.deviceToken = req.body.deviceToken;
    user.userId = user._id;
    if (req.body.profilePic) user.profilePic = req.body.profilePic;

    // to unset device token of other user from same handset.
    if (req.body.deviceToken)
      await User.updateMany(
        { deviceToken: req.body.deviceToken, email: { $ne: user.email } },
        { $set: { deviceToken: "" } }
      );

    await user.save();
    let response = _.pick(user, [
      "userId",
      "fullName",
      "mobile",
      "email",
      "status",
      "age",
      "gender",
      "profilePic",
      "coverImage",
      "userType",
      "insertDate",
      "locationName",
      "location",
      "address",
      "referralCode",
    ]);

    if (!response.mobile || response.mobile == "") {
      response.isNewUser = true;
      return res
        .status(200)
        .send({ statusCode: 200, message: "Success", data: response });
    }
    response.isNewUser = false;
    //subscribeToTopic(response.deviceToken, "allUsers");
    return res
      .header("Authorization", token)
      .send({ statusCode: 200, message: "Success", data: response });
  }

  if (user && user.status === "deleted") {
    await User.deleteOne({ _id: user._id });
  }
  // NOT required as i will be sending false in case mobile or otpToken is not present.
  if (
    !req.body.mobile ||
    req.body.mobile == "" ||
    !req.body.otpToken ||
    req.body.otpToken == ""
  ) {
    let tempResponse = {};
    tempResponse.isNewUser = true;
    return res
      .status(200)
      .send({ statusCode: 200, message: "Success", data: tempResponse });
  }

  if (req.body.otpToken) {
    let isValid = await verifyAndDeleteToken(
      req.body.mobile,
      req.body.otpToken,
      "UR"
    );

    //console.log("IsValid: ", isValid)
    if (!isValid) {
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: AUTH_CONSTANTS.INVALID_OTP,
      });
    }
  }

  user = new User(
    _.pick(req.body, [
      "userType",
      "fullName",
      "mobile",
      "age",
      "gender",
      "deviceToken",
      "profilePic",
      "facebookId",
      "googleId",
      "appleId",
    ])
  );

  if (req.body.email) user.email = req.body.email.toLowerCase();
  if (req.body.userType == "facebook") user.userType = "facebook";
  if (req.body.userType == "google") user.userType = "google";
  if (req.body.userType == "apple") user.userType = "apple";

  user.status = "active";

  user.locationPoint = {
    type: "Point",
    coordinates: [req.body.location.lng, req.body.location.lat],
  };

  user.location = { lat: req.body.location.lat, lng: req.body.location.lng };
  user.locationName = req.body.locationName;

  const token = user.generateAuthToken();
  user.accessToken = token;

  // to unset device token of other user from same handset.
  if (req.body.deviceToken)
    await User.updateMany(
      { deviceToken: req.body.deviceToken },
      { $set: { deviceToken: "" } }
    );

  await user.save();
  user.userId = user._id;

  let response = _.pick(user, [
    "userId",
    "fullName",
    "mobile",
    "email",
    "status",
    "age",
    "gender",
    "profilePic",
    "coverImage",
    "userType",
    "insertDate",
    "locationName",
    "location",
    "address",
    "referralCode",
  ]);

  response.isNewUser = false;
  res
    .header("Authorization", token)
    .send({ statusCode: 200, message: "Success", data: response });
  //subscribeToTopic(response.deviceToken, "allUsers");
});

// Forgot Password Request(email link generate)
// router.post("/forgotPassword", async (req, res) => {
//   const { error } = forgotPassword(req.body);
//   if (error)
//     return res.status(400).send({
//       statusCode: 400,
//       message: "Failure",
//       data: error.details[0].message,
//     });

//   let email = req.body.email.toLowerCase();
//   // verify if user exists
//   let user = await User.findOne({ email: email });
//   if (!user)
//     return res.status(400).send({
//       statusCode: 400,
//       message: "Failure",
//       data: AUTH_CONSTANTS.INVALID_EMAIL,
//     });

//   var otp = await Otp.findOne({ email: req.body.email });
//   if (otp) {
//     await Otp.deleteOne({ _id: otp._id });
//   }

//   otp = new Otp({
//     email: user.email,
//     otpExpiry:
//       Date.now() + config.get("reset_password_otp_expiry_in_mins") * 60 * 1000,
//   });
//   otp.otp = otp.generateOtp();
//   await otp.save();

//   // SEND EMAIL
//   const result = await sendResetPasswordMail(
//     user.email,
//     user.userName,
//     `/auth/forgotPassword/${user._id}/${otp.otp}`
//   );
//   if (result.code) {
//     return res.status(500).send({
//       message: "Failure",
//       statusCode: 500,
//       data: AUTH_CONSTANTS.CHANGE_PASSWORD_REQUEST_EMAIL_FAILURE,
//     });
//   }

//   return res.send({
//     statusCode: 200,
//     message: "Success",
//     data: AUTH_CONSTANTS.CHANGE_PASSWORD_REQUEST_SUCCESS,
//   });
// });

//change password(user)
router.post("/password/change/", userAuth, async (req, res) => {
  const { error } = validateChangePassword(req.body);
  if (error)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: error.details[0].message,
    });

  let user = await User.findById(req.jwtData.userId);
  if (!user)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: AUTH_CONSTANTS.INVALID_USER,
    });

  const validPassword = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );
  if (!validPassword)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: AUTH_CONSTANTS.INVALID_PASSWORD,
    });

  let encryptPassword = await bcrypt.hash(
    req.body.newPassword,
    config.get("bcryptSalt")
  );

  user.password = encryptPassword;
  await user.save();
  res.send({
    statusCode: 200,
    message: "Success",
    data: AUTH_CONSTANTS.PASSWORD_CHANGE_SUCCESS,
  });
});

// Reset password/forget Password(user)
router.post("/forgotPassword", async (req, res) => {
  const { error } = validateResetMobilePassword(req.body);
  if (error)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: error.details[0].message,
    });

  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: AUTH_CONSTANTS.INVALID_EMAIL,
    });

  let isValid = await verifyAndDeleteToken(
    req.body.mobile,
    req.body.otpToken,
    "FP"
  );
  if (!isValid)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: AUTH_CONSTANTS.INVALID_OTP,
    });

  var encryptPassword = await bcrypt.hash(
    req.body.newPassword,
    config.get("bcryptSalt")
  );
  user.password = encryptPassword;

  await User.updateOne(
    { _id: user._id },
    { $set: { password: user.password } }
  );
  res.send({
    statusCode: 200,
    message: "Success",
    data: AUTH_CONSTANTS.PASSWORD_CHANGE_SUCCESS,
  });
});

function validateLogin(req) {
  const schema = Joi.object()
    .keys({
      email: Joi.string().min(5).max(255).email(),
      mobile: Joi.string().min(1).max(255),
      password: Joi.string().min(5).max(255).required(),
      version: Joi.string(),
      deviceToken: Joi.string(),
    })
    .xor("email", "mobile");

  return Joi.validate(req, schema);
}

function forgotPassword(req) {
  const schema = {
    email: Joi.string().min(5).max(255).email().required(),
    mobile: Joi.string(),
  };
  return Joi.validate(req, schema);
}

function validateChangePassword(req) {
  const schema = {
    oldPassword: Joi.string().min(5).max(255).required(),
    newPassword: Joi.string().min(5).max(255).required(),
  };
  return Joi.validate(req, schema);
}

function validateResetMobilePassword(req) {
  const schema = {
    email: Joi.string().min(5).max(255).email().required(),
    newPassword: Joi.string().min(5).max(255).required(),
    otpToken: Joi.number().required(),
  };
  return Joi.validate(req, schema);
}

function validateUserSocialPost(user) {
  const locationSchema = Joi.object().keys({
    lat: Joi.number(),
    lng: Joi.number(),
  });
  const schema = {
    userType: Joi.string().valid(["app", "google", "facebook", "apple"]),
    fullName: Joi.string().min(1).max(200).allow(""),
    email: Joi.string().email().allow(""),
    mobile: Joi.number(),
    age: Joi.number(),
    gender: Joi.string().valid(["male", "female"]),
    facebookId: Joi.when("userType", {
      is: "facebook",
      then: Joi.string().min(1).max(255).required(),
      otherwise: Joi.any(),
    }),
    googleId: Joi.when("userType", {
      is: "google",
      then: Joi.string().min(1).max(255).required(),
      otherwise: Joi.any(),
    }),
    appleId: Joi.when("userType", {
      is: "apple",
      then: Joi.string().min(1).required(),
      otherwise: Joi.any(),
    }),
    location: locationSchema,
    locationName: Joi.string(),
    version: Joi.string(),
    deviceToken: Joi.string().min(1).max(200).required(),
    profilePic: Joi.string().min(1).max(200).allow(""),
    otpToken: Joi.number(),
  };
  return Joi.validate(user, schema);
}

module.exports = router;
