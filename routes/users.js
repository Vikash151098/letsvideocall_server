const { USER_CONSTANTS } = require("../config/constant.js");
const mongoose = require("mongoose");
const config = require("config");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const {
  User,
  validateUserPost,
  validateUserPut,
  validateUserListGet,
  userProjection,
} = require("../models/user");
const { verifyAndDeleteToken } = require("../models/otp");
const { adminAuth, userAdminAuth } = require("../middleware/auth");

mongoose.set("debug", true);

router.get("/userList", adminAuth, async (req, res) => {
  let criteria = {};

  var skipVal, limitVal;
  if (isNaN(parseInt(req.query.offset))) skipVal = 0;
  else skipVal = parseInt(req.query.offset);

  if (isNaN(parseInt(req.query.limit))) limitVal = 5000;
  else limitVal = parseInt(req.query.limit);

  if (req.query.fullName) {
    var regexName = new RegExp(req.query.fullName, "i");
    criteria.fullName = regexName;
  }
  if (req.query.email) {
    criteria.email = req.query.email;
  }
  // if (req.query.mobile) {
  //   criteria.mobile = "+1" + req.query.mobile;
  // }

  if (req.query.status) criteria.status = req.query.status;

  if (req.query.startDate) {
    criteria.insertDate = { $gte: parseInt(req.query.startDate) };
  }
  if (req.query.endDate) {
    criteria.insertDate = { $lte: parseInt(req.query.endDate) };
  }
  if (req.query.startDate != null && req.query.endDate != null) {
    criteria.insertDate = {
      $gte: parseInt(req.query.startDate),
      $lte: parseInt(req.query.endDate),
    };
  }

  let userList = await User.aggregate([
    { $match: criteria },
    { $sort: { creationDate: -1 } },
    { $skip: skipVal },
    { $limit: limitVal },
    {
      $project: userProjection(),
    },
  ]);

  res
    .status(200)
    .send({ statusCode: 200, message: "Success", data: { userList } });
});

// Create a new user  "/users/registerUser"
router.post("/", async (req, res) => {
  const { error } = validateUserPost(req.body);
  if (error)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: error.details[0].message,
    });

  var email, mobile;
  if (req.body.email) email = req.body.email.toLowerCase() || "NMB";
  if (req.body.mobile) mobile = req.body.mobile || "NA";

  let user = await User.findOne({
    $or: [{ email: email }, { mobile: mobile }],
  });

  if (user && user.status !== "deleted") {
    if (email === user.email)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.EMAIL_ALREADY_EXISTS,
      });

    // if (req.body.mobile === user.mobile)
    //   return res.status(400).send({
    //     statusCode: 400,
    //     message: "Failure",
    //     data: USER_CONSTANTS.MOBILE_ALREADY_EXISTS,
    //   });
  }

  if (req.body.otpToken) {
    let isValid = await verifyAndDeleteToken(
      req.body.mobile,
      req.body.otpToken,
      "UR"
    );
    if (!isValid) {
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.INVALID_OTP,
      });
    }
  }

  //signup for deleted account
  if (user && user.status === "deleted") {
    await User.deleteOne({ _id: user._id });
  }

  user = new User(
    _.pick(req.body, [
      "userType",
      "fullName",
      "deviceToken",
      "profilePic",
      "facebookId",
      "googleId",
    ])
  );

  // Saving referral code.
  // if (req.body.referralCode) {
  //   let userTemp = await User.findOne({
  //     referralCode: req.body.referralCode,
  //     status: "active",
  //   });
  //   if (!userTemp) {
  //     return res.status(400).send({
  //       statusCode: 400,
  //       message: "Failure",
  //       data: USER_CONSTANTS.INVALID_REFERRAL_CODE,
  //     });
  //   } else {
  //     await User.updateOne(
  //       { referralCode: req.body.referralCode, status: "active" },
  //       { $inc: { totalReferral: 1, totalRewardPoint: 10 } }
  //     );
  //     user.referredBy = req.body.referralCode;
  //   }
  // }

  user.email = req.body.email.toLowerCase();

  // encrypt password
  if (req.body.password)
    user.password = await bcrypt.hash(
      req.body.password,
      config.get("bcryptSalt")
    );

  user.status = "active";

  const token = user.generateAuthToken();
  user.accessToken = token;

  // let referralCode = await user.createReferralCode();
  // user.referralCode = referralCode;

  // to unset device token of other user from same handset.
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

  response.isNewUser = false;

  //subscribeToTopic(response.deviceToken, "allUsers");
  return res
    .header("Authorization", token)
    .send({ statusCode: 200, message: "Success", data: response });
});

// Update existing user
router.put("/", userAdminAuth, async (req, res) => {
  const { error } = validateUserPut(req.body);
  if (error)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: error.details[0].message,
    });

  let user;
  if (req.jwtData.role === "admin") {
    user = await User.findById(req.body.userId);
    if (!user)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.INVALID_USER,
      });
  } else {
    user = await User.findById(req.jwtData.userId);
    if (!user)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.INVALID_USER,
      });
  }

  user.fullName = req.body.fullName || user.fullName;
  if (req.body.email && req.body.email != user.email) {
    tempUser = await User.findOne({ email: req.body.email });
    if (tempUser)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.EMAIL_ALREADY_EXISTS,
      });
    user.email = req.body.email;
  }
  if (req.body.mobile && req.body.mobile != user.mobile) {
    tempUser = await User.findOne({ mobile: req.body.mobile });
    if (tempUser)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.MOBILE_ALREADY_EXISTS,
      });

    if (!req.body.otpToken) {
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.OTP_MISSING_UPDATE,
      });
    } else {
      let isValid = await verifyAndDeleteToken(
        req.body.mobile,
        req.body.otpToken,
        "UU"
      );
      if (!isValid) {
        return res.status(400).send({
          statusCode: 400,
          message: "Failure",
          data: USER_CONSTANTS.INVALID_OTP,
        });
      }
    }
    user.mobile = req.body.mobile;
  }
  user.profilePic = req.body.profilePic || user.profilePic;

  if (req.jwtData.role == "admin") {
    user.status = req.body.status || user.status;
  }

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

  res.status(200).send({ statusCode: 200, message: "Success", data: response });
});

// Fetch own profile based on auth token
router.get("/profile", userAdminAuth, async (req, res) => {
  let criteria = {};
  let criteria1 = {};

  if (req.query.id) {
    criteria._id = mongoose.Types.ObjectId(req.query.id);
    criteria1.userId = req.query.id;
  } else {
    criteria._id = mongoose.Types.ObjectId(req.jwtData.userId);
    criteria1.userId = req.jwtData.userId;
  }
  let user = await User.findById(req.jwtData.userId);
  if (!user)
    return res.status(400).send({
      statusCode: 400,
      message: "Failure",
      data: USER_CONSTANTS.INVALID_USER,
    });

  let response = await User.aggregate([
    { $match: criteria },
    {
      $project: userProjection(),
    },
  ]);

  response = response[0];

  res.status(200).send({
    statusCode: 200,
    message: "Success",
    data: { response },
  });
});

//verify email or mobile
router.post("/verify", async (req, res) => {
  let criteria = {};
  let email;
  if (req.body.email) {
    email = req.body.email.toLowerCase() || "NMB";
    criteria.email = email;
  }
  if (req.body.mobile) {
    criteria.mobile = req.body.mobile;
  }
  if (req.body.email && req.body.mobile) {
    criteria = { $or: [{ email: email }, { mobile: req.body.mobile }] };
  }

  let user = await User.findOne(criteria);
  if (user && user.status !== "deleted") {
    if (email === user.email)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.EMAIL_ALREADY_EXISTS,
      });

    if (req.body.mobile === user.mobile)
      return res.status(400).send({
        statusCode: 400,
        message: "Failure",
        data: USER_CONSTANTS.MOBILE_ALREADY_EXISTS,
      });
  }

  return res.send({
    statusCode: 200,
    message: "Success",
    data: USER_CONSTANTS.VERIFICATION_SUCCESS,
  });
});

//Logout Api
router.put("/logout", userAuth, async (req, res) => {
  let result = await User.updateOne(
    { _id: req.jwtData.userId },
    { $unset: { accessToken: "", deviceToken: "" } }
  );
  if (result.n) {
    res.status(200).send({
      statusCode: 200,
      status: "Success",
      data: USER_CONSTANTS.LOGGED_OUT,
    });
  } else {
    return res.status(400).send({
      statusCode: 400,
      status: "Failure",
      data: USER_CONSTANTS.INVALID_USER,
    });
  }
});

router.post("/delete", userAuth, async (req, res) => {
  let result = await User.deleteOne({ _id: req.jwtData.userId });
  if (result.n) {
    await BlockUser.deleteMany({ userId: req.jwtData.userId });
    await Member.deleteMany({ userId: req.jwtData.userId });
    await CarnivalFeed.deleteMany({ userId: req.jwtData.userId });
    await CarnivalLike.deleteMany({ userId: req.jwtData.userId });
    await CarnivalComment.deleteMany({ userId: req.jwtData.userId });
    await Subscriber.deleteMany({ userId: req.jwtData.userId });
    await PublicFeed.deleteMany({ userId: req.jwtData.userId });
    await PublicLike.deleteMany({ userId: req.jwtData.userId });
    await PublicComment.deleteMany({ userId: req.jwtData.userId });
    await RoadKingQueen.deleteMany({ userId: req.jwtData.userId });
    await RoadKingQueenVote.deleteMany({ userId: req.jwtData.userId });
    await Chat.deleteMany({
      $or: [
        { senderId: req.jwtData.userId },
        { receiverId: req.jwtData.userId },
      ],
    });
    await Notification.deleteMany({ receiverId: req.jwtData.userId });

    res.status(200).send({
      statusCode: 200,
      status: "Success",
      data: USER_CONSTANTS.DELETED_USER,
    });
  } else {
    return res.status(400).send({
      statusCode: 400,
      status: "Failure",
      data: USER_CONSTANTS.INVALID_USER,
    });
  }
});

router.get("/searchUser", userAuth, async (req, res) => {
  // let user = await User.findById(req.jwtData.userId);
  // if (!user) return res.status(400).send({ statusCode: 400, message: "Failure", data: USER_CONSTANTS.INVALID_USER });

  let criteria = {};
  criteria._id = { $ne: mongoose.Types.ObjectId(req.jwtData.userId) };
  if (req.query.fullName) {
    var regexName = new RegExp(".*" + req.query.fullName + ".*", "i");
    criteria.fullName = { $regex: regexName };
  }
  let response = await User.aggregate([
    { $match: criteria },
    {
      $project: userProjection(),
    },
  ]);
  res.status(200).send({ statusCode: 200, message: "Success", data: response });
});

router.get("/people", userAuth, async (req, res) => {
  // const { error } = validatePeople(req.body);
  // if (error) return res.status(400).send({ statusCode: 400, message: "Failure", data: error.details[0].message });

  let distance = 0;
  if (req.query.distance) {
    distance = req.query.distance;
  }
  let lng = 0,
    lat = 0;
  if (req.query.lat) {
    lat = req.query.lat;
  }
  if (req.query.lng) {
    lng = req.query.lng;
  }

  locationPoint = {
    type: "Point",
    coordinates: [parseFloat(lng), parseFloat(lat)],
  };
  let userList = await User.aggregate([
    {
      $geoNear: {
        near: locationPoint,
        query: {
          _id: { $ne: mongoose.Types.ObjectId(req.jwtData.userId) },
          status: "active",
        },
        maxDistance: Math.round(distance * 1609.34),
        distanceMultiplier: 0.000621371,
        distanceField: "dist.calculated",
        spherical: true,
      },
    },
    { $sort: { "dist.calculated": 1 } },
    { $project: userProjection() },
  ]);

  res.status(200).send({ statusCode: 200, message: "Success", data: userList });
});
module.exports = router;
