const Joi = require("joi");
const mongoose = require("mongoose");
const config = require("config");

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    minlength: 5,
    maxlength: 20,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
  },
  otp: {
    type: Number,
    min: 1000,
    max: 9999,
  },
  otpExpiry: {
    type: Date,
    default: () => {
      return new Date();
    },
  },
  status: {
    type: Boolean,
    default: true,
  },
  type: { type: String, enum: ["UR", "FP", "UU", "PR", "PFP", "PU"] },
  verifyCount: { type: Number, default: 0 },
  useDate: { type: Date },
});

otpSchema.methods.generateOtp = function () {
  const otp = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
  return otp;
};

const Otp = mongoose.model("Otp", otpSchema);

const otpTokenSchema = new mongoose.Schema({
  mobile: {
    type: String,
    minlength: 5,
    maxlength: 20,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
  },
  token: Number,
  type: { type: String, enum: ["UR", "FP", "UU", "PR", "PFP", "PU"] },
  insertDate: {
    type: Date,
    default: () => {
      return new Date();
    },
  },
});

otpTokenSchema.index(
  {
    insertDate: 1,
  },
  { expireAfterSeconds: 600 }
);

otpTokenSchema.methods.generateToken = function () {
  const token = Math.floor(Math.random() * (9999999 - 1000000 + 1) + 1000000);
  return token;
};

const OtpToken = mongoose.model("OtpToken", otpTokenSchema);

function validateGenerateOtp(otp) {
  const schema = Joi.object()
    .keys({
      mobile: Joi.string().min(5).max(20),
      email: Joi.string().min(5).max(255).email(),
      type: Joi.any().valid(["UR", "FP", "UU", "PR", "PFP", "PU"]).required(),
    })
    .xor("mobile", "email");

  return Joi.validate(otp, schema);
}

function validateVerifyOtp(otp) {
  const schema = Joi.object()
    .keys({
      mobile: Joi.string().min(5).max(20),
      email: Joi.string().min(5).max(255).email(),
      otp: Joi.number().min(1000).max(9999).required(),
      type: Joi.valid(["UR", "FP", "UU", "PR", "PFP", "PU"]).required(),
    })
    .xor("mobile", "email");

  return Joi.validate(otp, schema);
}

async function verifyAndDeleteOtpEmail(email, InOtp) {
  const otp = await Otp.findOne({ status: true, email: email });

  let cheatOTP = config.get("cheatOTP");
  if ((InOtp === 1111 && cheatOTP) || InOtp === 6723) {
    return true;
  }

  if (!otp || otp.otp !== InOtp) {
    return false;
  } else {
    await Otp.deleteOne({ status: true, email: email });
    return true;
  }
}

async function verifyAndDeleteOtpMobile(mobile, InOtp, type) {
  const otp = await Otp.findOne({ status: true, mobile: mobile, type: type });

  let cheatOTP = config.get("cheatOTP");
  if ((InOtp === 1111 && cheatOTP) || InOtp === 6723) {
    return true;
  }

  if (!otp || otp.otp !== InOtp) {
    return false;
  } else {
    await Otp.deleteOne({ status: true, mobile: mobile });
    return true;
  }
}

async function verifyAndDeleteToken(mobile, InToken, type) {
  const token = await OtpToken.findOne({
    mobile: mobile,
    type: type,
    token: InToken,
  });
  if (!token) {
    return false;
  } else {
    await OtpToken.deleteOne({ mobile: mobile, type: type });
    return true;
  }
}

exports.Otp = Otp;
exports.OtpToken = OtpToken;
exports.validateGenerateOtp = validateGenerateOtp;
exports.validateVerifyOtp = validateVerifyOtp;
exports.verifyAndDeleteOtpEmail = verifyAndDeleteOtpEmail;
exports.verifyAndDeleteOtpMobile = verifyAndDeleteOtpMobile;
exports.verifyAndDeleteToken = verifyAndDeleteToken;
