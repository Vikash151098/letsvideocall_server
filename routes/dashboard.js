const mongoose = require("mongoose");
const config = require("config");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const { adminAuth } = require("../middleware/auth");
// const { Booking } = require('../models/booking');
mongoose.set("debug", true);

router.get("/", adminAuth, async (req, res) => {
  var resObj = {};
  let criteria = {};
  let totalUsers = await User.find({}).count();
  let totalCarnivals = await Carnival.find({}).count();
  let totalGroups = await Group.find({}).count();
  let totalReports = await ReportUser.find({}).count();
  let totalContests = await Contest.find({}).count();

  resObj.totalUsers = totalUsers || 0;
  resObj.totalCarnivals = totalCarnivals || 0;
  resObj.totalGroups = totalGroups || 0;
  resObj.totalReports = totalReports || 0;
  resObj.totalContests = totalContests || 0;


  return res.status(200).send({ statusCode: 200, mesage: "Success", data: resObj });
});

router.get("/userData", adminAuth, async (req, res) => {
  let userData = await User.aggregate([
    { $group: { _id: "$status", value: { $sum: 1 } } },
    { $project: { _id: 0, name: "$_id", value: 1 } }
  ]);
  return res.status(200).send({ statusCode: 200, message: "Success", data: userData });
});

router.get("/carnivalData", adminAuth, async (req, res) => {
  let currTime = Math.round(new Date() / 1000);
  let upcomingCarnival = await Carnival.aggregate([
    { $match: { startDate: { $gt: currTime } } },
    {
      $group: {
        _id: null,
        value: { $sum: 1 }
      }
    },
    { $project: { _id: 0, name: "upcomingCarnival", value: 1 } }
  ]);
  if (!upcomingCarnival[0]) {
    upcomingCarnival[0] = {
      value: 0,
      name: "upcomingCarnival"
    }

  }
  let ongoingCarnival = await Carnival.aggregate([
    { $match: { $and: [{ startDate: { $lte: currTime } }, { endDate: { $gt: currTime } }] } },
    {
      $group: {
        _id: null,
        value: { $sum: 1 }
      }
    },
    { $project: { _id: 0, name: "ongoingCarnival", value: 1 } }
  ]);

  if (!ongoingCarnival[0]) {
    ongoingCarnival[0] = {
      value: 0,
      name: "ongoingCarnival"
    };
  }
  let completedCarnival = await Carnival.aggregate([
    { $match: { startDate: { $lt: currTime } } },
    {
      $group: {
        _id: null,
        value: { $sum: 1 }
      }
    },
    { $project: { _id: 0, name: "completedCarnival", value: 1 } }
  ]);

  if (!completedCarnival) {
    completedCarnival[0] = {
      value: 0,
      name: "completedCarnival"
    }
  }
  let carnivalData = [];
  carnivalData.push(upcomingCarnival[0]);
  carnivalData.push(ongoingCarnival[0]);
  carnivalData.push(completedCarnival[0]);

  return res.status(200).send({ statusCode: 200, message: "Success", data: carnivalData });
});

router.get("/contestData", adminAuth, async (req, res) => {
  let currTime = Math.round(new Date() / 1000);
  let upcomingContest = await Contest.aggregate([
    { $match: { startDate: { $gt: currTime } } },
    {
      $group: {
        _id: null,
        value: { $sum: 1 }
      }
    },
    { $project: { _id: 0, name: "upcomingContest", value: 1 } }
  ]);
  if (!upcomingContest[0]) {
    upcomingContest[0] = {
      value: 0,
      name: "upcomingContest"
    }

  }
  let ongoingContest = await Contest.aggregate([
    { $match: { $and: [{ startDate: { $lte: currTime } }, { endDate: { $gt: currTime } }] } },
    {
      $group: {
        _id: null,
        value: { $sum: 1 }
      }
    },
    { $project: { _id: 0, name: "ongoingContest", value: 1 } }
  ]);

  if (!ongoingContest[0]) {
    ongoingContest[0] = {
      value: 0,
      name: "ongoingContest"
    };
  }
  let completedContest = await Contest.aggregate([
    { $match: { startDate: { $lt: currTime } } },
    {
      $group: {
        _id: null,
        value: { $sum: 1 }
      }
    },
    { $project: { _id: 0, name: "completedContest", value: 1 } }
  ]);

  if (!completedContest) {
    completedContest[0] = {
      value: 0,
      name: "completedContest"
    }
  }
  let contestData = [];
  contestData.push(upcomingContest[0]);
  contestData.push(ongoingContest[0]);
  contestData.push(completedContest[0]);

  return res.status(200).send({ statusCode: 200, message: "Success", data: contestData });
});

router.get("/reportData", adminAuth, async (req, res) => {
  let reportData = await ReportUser.aggregate([
    { $group: { _id: "$feedType", value: { $sum: 1 } } },
    { $project: { _id: 0, name: "$_id", value: 1 } }
  ]);
  return res.status(200).send({ statusCode: 200, message: "Success", data: reportData });
});

//last 30 day's registered users from Users collection
router.get("/monthlyUserData", adminAuth, async (req, res) => {
  let userData = await User.aggregate([
    {
      $match: {
        creationDate: {
          $gte: new Date(new Date().getTime() - config.get("dashboard.Days") * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$creationDate" },
          month: { $month: "$creationDate" },
          year: { $year: "$creationDate" }
        },
        value: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    {
      $project: {
        _id: 0,
        name: {
          $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.day" }, "-", { $toString: "$_id.year" }]
        },
        value: 1
      }
    },
    { $limit: 30 }
  ]);

  return res.status(200).send([{ statusCode: 200, name: "Users Registered", series: userData }]);
});


module.exports = router;
