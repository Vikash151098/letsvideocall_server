const { NOTIFICATION_CONSTANTS } = require("../config/constant.js");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { Admin, validateLogin, validateNotifications } = require("../models/admin");
const { adminAuth, userAuth } = require("../middleware/auth");
const { sendMsgToTopic } = require("../services/fcmModule");
const { Notification } = require('../models/notification');
const express = require("express");
const router = express.Router();

router.get("/", userAuth, async (req, res) => {
    let notificationList = await Notification.aggregate([
        {
            $match: { receiverId: req.jwtData.userId }
        },
        {
            $addFields: {
                // senderId: { $toObjectId: "$senderId" },
                "senderId": {
                    $cond: {
                        if: { $eq: ["$senderId", ""] },
                        then: null,
                        else: { $toObjectId: "$senderId" }
                    },
                },
            }
        },
        { $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sData" } },
        { $sort: { creationDate: -1 } },
        {
            $project: {
                senderId: 1,
                receiverId: 1,
                type: 1,
                id: 1,
                title: 1,
                message: 1,
                image: 1,
                insertDate: 1,
                creationDate: 1,
                senderProfilePic: { $arrayElemAt: ["$sData.profilePic", 0] },
                senderName: { $arrayElemAt: ["$sData.fullName", 0] }
            }
        }
    ]);
    return res.send({ statusCode: 200, message: "Success", data: { notificationList } });
});


// router.post("/notifications", adminAuth, async (req, res) => {
//     const { error } = validateNotifications(req.body);
//     if (error) return res.status(400).send({ statusCode: 400, message: "Failure", data: error.details[0].message });

//     let data = {
//         notification: { title: req.body.title, body: req.body.message },
//         topic: "allUsers"
//     };

//     let notification = new Notification({});
//     notification.senderId = req.jwtData.userId;
//     notification.type = "admin";
//     notification.title = req.body.title;
//     notification.message = req.body.message;
//     notification.image = req.body.image;

//     await notification.save();

//     sendMsgToTopic(data);
//     return res.send({ statusCode: 200, message: "Success", data: ADMIN_CONSTANTS.NOTIFICATION_SUCCESS });
// });



module.exports = router;
