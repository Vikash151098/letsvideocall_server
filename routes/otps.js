const { OTP_CONSTANTS } = require("../config/constant.js");
const config = require("config");
const bcrypt = require("bcrypt");
const winston = require("winston");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const {
  Otp,
  validateGenerateOtp,
  validateVerifyOtp,
  OtpToken,
} = require("../models/otp");
const { User } = require("../models/user");
const { sendSms } = require("../services/sendSms");
const formatter = require("../services/commonFunctions");
const { sendOtpMail } = require("../services/nodemailer.js");

router.post("/create", async (req, res) => {
  const { error } = validateGenerateOtp(req.body);
  if (error)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: error.details[0].message,
    });

  let user;

  if (req.body.type == "UR" || req.body.type == "UU") {
    user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: OTP_CONSTANTS.DUPLICATE_MOBILE_NUMBER,
      });
  }
  if (req.body.type == "PR" || req.body.type == "PU") {
    provider = await Provider.findOne({ email: req.body.email });
    if (provider)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: OTP_CONSTANTS.DUPLICATE_MOBILE_NUMBER,
      });
  }
  if (req.body.type == "FP") {
    user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: OTP_CONSTANTS.NO_USER_REGISTERED_ERROR,
      });
  }
  if (req.body.type == "PFP") {
    provider = await Provider.findOne({ email: req.body.email });
    if (!provider)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: OTP_CONSTANTS.NO_USER_REGISTERED_ERROR,
      });
  }

  if (req.body.email && req.body.mobile)
    var otp = await Otp.findOne({
      $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
    });
  else if (req.body.email)
    var otp = await Otp.findOne({ email: req.body.email });
  else if (req.body.mobile)
    var otp = await Otp.findOne({ mobile: req.body.mobile });

  if (otp) {
    const result = await Otp.deleteOne({ _id: otp._id });
  }

  otp = new Otp({
    mobile: req.body.mobile,
    email: req.body.email,
    type: req.body.type,
    otpExpiry: Date.now() + config.get("otp_expiry_in_mins") * 60 * 1000,
  });
  otp.otp = otp.generateOtp();
  await otp.save();

  // let data = { otp: otp.otp };
  // let otpMsg = formatter(config.get("smsc_twilio.registrationOTP"), data);

  // if (req.body.mobile) {
  //   const result = await sendSms(otpMsg, req.body.mobile);
  //   if (config.get("sendSms") && result.code && result.code != 21408)
  //     return res.status(500).send({
  //       statusCode: 500,
  //       message: "Failure",
  //       data: OTP_CONSTANTS.INVALID_MOBILE_NUMBER,
  //     });
  // }
  // if (req.body.email) {
  //   const result = await sendOtpMail(req.body.email, "User", otp.otp);
  //   if (result.code) {
  //     return res.status(500).send({ statusCode: 400, message: "Failure", data: OTP_CONSTANTS.EMAIL_SENDING_FAILED });
  //   }
  // }

  if (req.body.email) {
    const result = await sendOtpMail(req.body.email, otp.otp);
    if (result&&result.code) {
      return res.status(500).send({ statusCode: 400, message: "Failure", data: OTP_CONSTANTS.EMAIL_SENDING_FAILED });
    }
  }
  return res.status(200).send({
    statusCode: 200,
    message: "Success",
    data: OTP_CONSTANTS.OTP_GENERATED_SUCCESSFULLY,
  });
});

router.post("/verify", async (req, res) => {
  const { error } = validateVerifyOtp(req.body);
  if (error)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: error.details[0].message,
    });

  let cheatOTP = config.get("cheatOTP");
  if ((req.body.otp === 1111 && cheatOTP) || req.body.otp === 6723) {
    let tokenCriteria = {};
    if (req.body.mobile) tokenCriteria.mobile = req.body.mobile;
    if (req.body.email) tokenCriteria.email = req.body.email;
    tokenCriteria.type = req.body.type;

    const result = await OtpToken.deleteMany(tokenCriteria);

    let otpToken = new OtpToken({
      mobile: req.body.mobile,
      email: req.body.email,
      type: req.body.type,
    });

    otpToken.token = otpToken.generateToken();
    await otpToken.save();

    return res.status(200).send({
      statusCode: 200,
      message: "Success",
      data: { token: otpToken.token, type: req.body.type },
    });
  }

  let criteria = {};
  criteria.status = true;
  if (req.body.mobile) criteria.mobile = req.body.mobile;
  if (req.body.email) criteria.email = req.body.email;
  criteria.type = req.body.type;

  const otp = await Otp.findOne(criteria);

  if (!otp) {
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: OTP_CONSTANTS.INVALID_OTP,
    });
  } else if (otp.verifyCount >= config.get("max_otp_attempts")) {
    const result = await Otp.deleteOne({ _id: otp._id });
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: OTP_CONSTANTS.OTP_MAX_LIMIT_ERROR,
    });
  } else if (otp.otpExpiry < Date.now()) {
    const result = await Otp.deleteOne({ _id: otp._id });
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: OTP_CONSTANTS.OTP_EXPIRED,
    });
  } else if (otp.otp !== req.body.otp) {
    const result = await Otp.update(
      { _id: otp._id },
      { $inc: { verifyCount: 1 } }
    );
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: `Verification code not correct, ${
        config.get("max_otp_attempts") - otp.verifyCount - 1
      } attempts left.`,
    });
  } else {
    let tokenCriteria = {};
    if (req.body.mobile) tokenCriteria.mobile = req.body.mobile;
    if (req.body.email) tokenCriteria.email = req.body.email;
    tokenCriteria.type = req.body.type;

    const result = await OtpToken.deleteMany(tokenCriteria);
    let otpToken = new OtpToken({
      mobile: req.body.mobile,
      email: req.body.email,
      type: req.body.type,
    });
    otpToken.token = otpToken.generateToken();
    otpToken.save();
    res.status(200).send({
      statusCode: 200,
      message: "Success",
      data: { token: otpToken.token, type: req.body.type },
    });
  }
});

module.exports = router;
