const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { Chat } = require("../models/chat");
const { User } = require("../models/user");
// const { Provider } = require("../models/provider");
const { userAuth, userProviderAuth } = require("../middleware/auth");
const { CHAT_CONSTANTS } = require('../config/constant');

router.get("/summary", userAuth, async (req, res) => {

  let blockUser = await BlockUser.find({ userId: req.jwtData.userId }).select({ _id: 0, blockUserId: 1 })
  let blockUsers = [];
  for (let i = 0; i < blockUser.length; i++) {
    blockUsers.push(blockUser[i].blockUserId);
  }

  let blockedUser = await BlockUser.find({ blockUserId: req.jwtData.userId }).select({ _id: 0, userId: 1 })
  let blockedUsers = [];
  for (let i = 0; i < blockedUser.length; i++) {
    blockedUsers.push(blockedUser[i].userId);
  }

  let currentUserId = req.jwtData.userId;
  let chatSummaryList = await Chat.aggregate([
    {
      $match: {
        deletedBy: { $nin: [currentUserId] },
        $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
      }
    },
    { $sort: { _id: 1 } },
    {
      $group: {
        _id: "$conversationId",
        senderId: { $last: "$senderId" },
        receiverId: { $last: "$receiverId" },
        message: { $last: "$message" },
        sentAt: { $last: "$sentAt" },
        isRead: { $last: "$isRead" },
        readAt: { $last: "$readAt" },
        isDelivered: { $last: "$isDelivered" },
        deliveredAt: { $last: "$deliveredAt" },
        blockBy: { $last: "$blockBy" },
        unReadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$receiverId", currentUserId] }] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        senderId: { $toObjectId: "$senderId" },
        receiverId: { $toObjectId: "$receiverId" },
        "chatUser": {
          $cond: {
            if: { $eq: ["$senderId", currentUserId] },
            then: "$receiverId",
            else: "$senderId"
          },
        },
      }
    },
    { $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sData" } },
    { $lookup: { from: "users", localField: "receiverId", foreignField: "_id", as: "rData" } },
    {
      $project: {
        conversationId: "$_id",
        senderId: 1,
        message: 1,
        receiverId: 1,
        sentAt: 1,
        isRead: 1,
        readAt: 1,
        isDelivered: 1,
        deliveredAt: 1,
        chatUser: 1,
        blockByReceiver: { $in: ["$chatUser", blockedUsers] },
        blockByYou: { $in: ["$chatUser", blockUsers] },
        unReadCount: 1,
        senderFullName: { $arrayElemAt: ["$sData.fullName", 0] },
        senderProfilePic: { $arrayElemAt: ["$sData.profilePic", 0] },
        receiverFullName: { $arrayElemAt: ["$rData.fullName", 0] },
        receiverProfilePic: { $arrayElemAt: ["$rData.profilePic", 0] }
      }
    },
    { $sort: { sentAt: -1 } }
  ]);
  return res.status(200).send({ statusCode: 200, message: "Success", data: { chatSummaryList } });
});

router.get("/individual", userAuth, async (req, res) => {
  var skipVal, limitVal;
  if (isNaN(parseInt(req.query.offset))) skipVal = 0;
  else skipVal = parseInt(req.query.offset);
  if (isNaN(parseInt(req.query.limit))) limitVal = 150;
  else limitVal = parseInt(req.query.limit);
  let currentUserId = req.jwtData.userId;
  let chatUserId = req.query.userId;
  let conversationId = [currentUserId, chatUserId].sort().join(".");
  // update to read/delivered
  let readByUser = await Chat.updateMany(
    {
      conversationId: conversationId,
      receiverId: currentUserId,
      $or: [{ isRead: false }, { isDelivered: false }]
    },
    { $set: { isRead: true, isDelivered: true, readAt: new Date(), deliveredAt: new Date() } }
  );
  let blockUser = await BlockUser.find({ userId: req.jwtData.userId }).select({ _id: 0, blockUserId: 1 })
  let blockUsers = [];
  for (let i = 0; i < blockUser.length; i++) {
    blockUsers.push(blockUser[i].blockUserId);
  }

  let blockedUser = await BlockUser.find({ blockUserId: req.jwtData.userId }).select({ _id: 0, userId: 1 })
  let blockedUsers = [];
  for (let i = 0; i < blockedUser.length; i++) {
    blockedUsers.push(blockedUser[i].userId);
  }

  let chatList = await Chat.aggregate([
    {
      $match: {
        conversationId: conversationId,
        deletedBy: { $nin: [currentUserId] }
      }
    },
    {
      $addFields: {
        "chatUser": {
          $cond: {
            if: { $eq: ["$senderId", currentUserId] },
            then: "$receiverId",
            else: "$senderId"
          },
        },
      }
    },
    { $sort: { sentAt: -1 } },
    { $skip: skipVal },
    { $limit: limitVal },
    {
      $project: {
        conversationId: 1,
        senderId: 1,
        receiverId: 1,
        message: 1,
        sentAt: 1,
        isRead: 1,
        readAt: 1,
        isDelivered: 1,
        deliveredAt: 1,
        type: 1,
        additionalData: 1,
        isOwnMessage: { $cond: [{ $eq: ["$senderId", currentUserId] }, true, false] },
        blockByReceiver: { $in: ["$chatUser", blockedUsers] },
        blockByYou: { $in: ["$chatUser", blockUsers] },
      }
    },
    { $sort: { sentAt: 1 } }
  ]);
  let currentUser = await User.findOne(
    { _id: currentUserId },
    { userId: "$_id", firstname: 1, lastname: 1, username: 1, profile_pic: 1 }
  );
  let chatUser = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(chatUserId) } },
    {
      $project: {
        userId: "$_id", firstname: 1, lastname: 1, username: 1, profile_pic: 1,
        blockByReceiver: { $in: [chatUserId, blockedUsers] },
        blockByYou: { $in: [chatUserId, blockUsers] },
      }
    }

  ]);

  chatUser = chatUser[0];

  return res.status(200).send({ statusCode: 200, message: "Success", data: { chatList, currentUser, chatUser } });
});

router.post("/deleteBy", userAuth, async (req, res) => {

  let currentUserId = req.jwtData.userId;
  let chat = await Chat.findOne({
    conversationId: req.body.conversationId,
    deletedBy: { $nin: [currentUserId] },
    $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
  });
  if (!chat) return res.status(400).send({ statusCode: 400, message: "Failure", data: CHAT_CONSTANTS.NOT_FOUND });

  let deleteBy = [];
  deleteBy = chat.deletedBy;
  deleteBy.push(currentUserId);
  // console.log("variable data:", deleteBy);
  await Chat.updateMany({ conversationId: req.body.conversationId }, { $set: { deletedBy: deleteBy } });
  // chat.deletedBy = deleteBy;
  // await chat.save();

  return res.status(200).send({ statusCode: 200, message: "Success", data: CHAT_CONSTANTS.CHAT_DELETED });
});

module.exports = router;
