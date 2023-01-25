const { ADMIN_CONSTANTS } = require("../config/constant.js");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { Admin, validateLogin, validateNotifications } = require("../models/admin");
const { adminAuth } = require("../middleware/auth");
const { sendMsgToTopic } = require("../services/fcmModule");
const { Notification } = require('../models/notification');
const express = require("express");
const router = express.Router();

router.post("/login", async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send({ statusCode: 400, message: "Failure", data: error.details[0].message });

    let email = req.body.email.toLowerCase();

    let admin = await Admin.findOne({ email: email });
    if (!admin)
        return res.status(400).send({ statusCode: 400, message: "Failure", data: ADMIN_CONSTANTS.INVALID_EMAIL });

    const validPassword = await bcrypt.compare(req.body.password, admin.password);
    if (!validPassword)
        return res.status(400).send({ statusCode: 400, message: "Failure", data: ADMIN_CONSTANTS.INVALID_EMAIL });

    const token = admin.generateAuthToken();
    // admin.accessToken = token;
    admin.deviceToken = req.body.deviceToken;

    await admin.save();
    let response = _.pick(admin, ["email", "status", "createdAt", "_id"]);

    res.header("Authorization", token).send({ statusCode: 200, message: "Success", data: response });
});

router.post("/notifications", adminAuth, async (req, res) => {
    const { error } = validateNotifications(req.body);
    if (error) return res.status(400).send({ statusCode: 400, message: "Failure", data: error.details[0].message });

    let data = {
        notification: { title: req.body.title, body: req.body.message },
        topic: "allUsers"
    };

    let notification = new Notification({});
    notification.senderId = req.jwtData.userId;
    notification.type = "admin";
    notification.title = req.body.title;
    notification.message = req.body.message;
    notification.image = req.body.image;

    await notification.save();

    sendMsgToTopic(data);
    return res.send({ statusCode: 200, message: "Success", data: ADMIN_CONSTANTS.NOTIFICATION_SUCCESS });
});

router.get("/notifications", adminAuth, async (req, res) => {
    let notificationList = await Notification.aggregate([{ $match: { type: "admin" } }, { $sort: { creationDate: -1 } }]);
    return res.send({ statusCode: 200, message: "Success", data: { notificationList } });
});

module.exports = router;
