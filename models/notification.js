const Joi = require("joi");
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    senderId: { type: String, default: "" },
    receiverId: String,
    type: {
        type: String,
        enum: ["admin", "likeFeed", "commentFeed", "likePhoto", "commentPhoto",
            "newMessage", "3DaysCarnivalReminder", "1DaysCarnivalReminder",
            "sameDaysCarnivalReminder", "chooseBand", "contestCommencement",
            "carnivalAttendees", "voteReminder", "winnerRoadKing", "winnerRoadQueen", "winnerVoter"]
    },
    id: { type: String, default: "" },
    title: { type: String, minLength: 1, maxLenght: 200 },
    message: { type: String, minLength: 1, maxLenght: 500 },
    image: { type: String, minLength: 1, maxLenght: 500 },
    insertDate: {
        type: Date,
        default: () => {
            return new Date();
        }
    },
    creationDate: {
        type: Number,
        default: () => { return Math.round(new Date() / 1000); }
    }
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports.Notification = Notification;
