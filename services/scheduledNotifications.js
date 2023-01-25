const config = require("config");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const { sendFCM, sendMultipleFCM } = require("../services/fcmModule");
const { sendGeneralMail } = require("../services/sendMail");
const formatter = require("../services/commonFunctions");
const { Carnival, Member } = require('../models/carnival');
const { Contest, ContestWon } = require('../models/contest');
const { RoadKingQueenVote } = require('../models/roadKingQueen');

mongoose.set("debug", true);

var is3DaysBeforeDone = true;
async function send3DaysBeforeReminder() {
    if (is3DaysBeforeDone) {
        is3DaysBeforeDone = false;
        let flag = true;
        while (flag) {
            try {
                let currTime = Math.round(new Date() / 1000);
                let carnivalList = await Carnival.aggregate([
                    {
                        $match: {
                            send3DaysBeforeReminder: false,
                            $and: [{ startDate: { $lte: currTime + 3 * 86400 } }, { startDate: { $gt: currTime } }]
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            carnivalId: { $toString: "$_id" },
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            let: {
                                carnivalId: "$carnivalId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$carnivalId", "$$carnivalId"] } },
                                        ]
                                    }
                                },
                                { $sort: { insertDate: 1 } },
                                {
                                    $addFields: {
                                        userId: { $toObjectId: "$userId" }
                                    }
                                },
                                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
                                {
                                    $project: {
                                        _id: 0,
                                        userDeviceToken: { $arrayElemAt: ["$userData.deviceToken", 0] }
                                    }
                                }
                            ],
                            as: "memberData"
                        }
                    }
                ]);

                if (carnivalList.length == 0) {
                    flag = false;
                    break;
                }

                let carnival = carnivalList[0];
                let member = carnival.memberData;

                // Set  3 days reminder flag true. 
                await Carnival.updateOne({ _id: carnival._id }, { $set: { send3DaysBeforeReminder: true } });

                // console.log("carnival", carnival);
                // console.log("memberData", carnival.memberData[0]);
                let regIds = [];
                for (let index = 0; index < member.length; index++) {
                    if (member[index].userDeviceToken && member[index].userDeviceToken != "") {
                        regIds.push(member[index].userDeviceToken);
                    }
                }
                // SEND FCM
                if (regIds.length > 0) {
                    let data1 = {
                        carnivalName: carnival.title
                    }
                    let data = {
                        title: formatter(config.get("notifications.3DaysCarnivalReminderTitle"), data1),
                        message: formatter(config.get("notifications.3DaysCarnivalReminder"), data1),
                        type: "3DaysCarnivalReminder",
                        id: carnival._id.toString(),
                        contestTitle: ""
                    };
                    sendMultipleFCM(regIds, data);
                }
            }
            catch (Ex) {
                console.log(Ex);
            }
        }
        is3DaysBeforeDone = true;
    }
}

var is1DaysBeforeDone = true;
async function send1DaysBeforeReminder() {
    if (is1DaysBeforeDone) {
        is1DaysBeforeDone = false;
        let flag = true;
        while (flag) {
            try {
                let currTime = Math.round(new Date() / 1000);
                let carnivalList = await Carnival.aggregate([
                    {
                        $match: {
                            send1DaysBeforeReminder: false,
                            $and: [{ startDate: { $lte: currTime + 86400 } }, { startDate: { $gt: currTime } }]
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            carnivalId: { $toString: "$_id" },
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            let: {
                                carnivalId: "$carnivalId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$carnivalId", "$$carnivalId"] } },
                                        ]
                                    }
                                },
                                { $sort: { insertDate: 1 } },
                                {
                                    $addFields: {
                                        userId: { $toObjectId: "$userId" }
                                    }
                                },
                                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
                                {
                                    $project: {
                                        _id: 0,
                                        userDeviceToken: { $arrayElemAt: ["$userData.deviceToken", 0] }
                                    }
                                }
                            ],
                            as: "memberData"
                        }
                    }
                ]);

                if (carnivalList.length == 0) {
                    flag = false;
                    break;
                }

                let carnival = carnivalList[0];
                let member = carnival.memberData;

                // Set 1 Day reminder flag true . 
                await Carnival.updateOne({ _id: carnival._id }, { $set: { send1DaysBeforeReminder: true } });

                let regIds = [];
                for (let index = 0; index < member.length; index++) {
                    if (member[index].userDeviceToken && member[index].userDeviceToken != "") {
                        regIds.push(member[index].userDeviceToken);
                    }
                }
                // SEND FCM
                if (regIds.length > 0) {
                    let data1 = {
                        carnivalName: carnival.title
                    }
                    let data = {
                        title: formatter(config.get("notifications.1DaysCarnivalReminderTitle"), data1),
                        message: formatter(config.get("notifications.1DaysCarnivalReminder"), data1),
                        type: "1DaysCarnivalReminder",
                        id: carnival._id.toString(),
                        contestTitle: ""
                    };
                    sendMultipleFCM(regIds, data);
                }

            }
            catch (Ex) {
                console.log(Ex);
            }
        }
        is1DaysBeforeDone = true;
    }
}

var isSameDaysBeforeDone = true;
async function sendSameDaysBeforeReminder() {
    if (isSameDaysBeforeDone) {
        isSameDaysBeforeDone = false;
        let flag = true;
        while (flag) {
            try {
                let currTime = Math.round(new Date() / 1000);
                let carnivalList = await Carnival.aggregate([
                    {
                        $match: {
                            sendSameDayReminder: false,
                            startDate: { $lte: currTime }
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            carnivalId: { $toString: "$_id" },
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            let: {
                                carnivalId: "$carnivalId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$carnivalId", "$$carnivalId"] } },
                                        ]
                                    }
                                },
                                { $sort: { insertDate: 1 } },
                                {
                                    $addFields: {
                                        userId: { $toObjectId: "$userId" }
                                    }
                                },
                                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
                                {
                                    $project: {
                                        _id: 0,
                                        userDeviceToken: { $arrayElemAt: ["$userData.deviceToken", 0] }
                                    }
                                }
                            ],
                            as: "memberData"
                        }
                    }
                ]);

                if (carnivalList.length == 0) {
                    flag = false;
                    break;
                }

                let carnival = carnivalList[0];
                let member = carnival.memberData;

                // Set Same Day reminder flag true . 
                await Carnival.updateOne({ _id: carnival._id }, { $set: { sendSameDayReminder: true } });

                let regIds = [];
                for (let index = 0; index < member.length; index++) {
                    if (member[index].userDeviceToken && member[index].userDeviceToken != "") {
                        regIds.push(member[index].userDeviceToken);
                    }
                }
                // SEND FCM
                if (regIds.length > 0) {
                    let data1 = {
                        carnivalName: carnival.title
                    }
                    let data = {
                        title: formatter(config.get("notifications.sameDaysCarnivalReminderTitle"), data1),
                        message: formatter(config.get("notifications.sameDaysCarnivalReminder"), data1),
                        type: "sameDaysCarnivalReminder",
                        id: carnival._id.toString(),
                        contestTitle: ""
                    };
                    sendMultipleFCM(regIds, data);
                }

            }
            catch (Ex) {
                console.log(Ex);
            }
        }
        isSameDaysBeforeDone = true;
    }
}

var isContestCheckDone = true;
async function contestWon() {
    if (isContestCheckDone) {
        isContestCheckDone = false;
        let flag = true;
        while (flag) {
            try {
                let isSend = false;
                let currTime = Math.round(new Date() / 1000) - 50 * 60 * 60;

                let contestList = await Contest.aggregate([
                    {
                        $match: {
                            isWinnerAnnounced: false,
                            $and: [{ startDate: { $lte: currTime } }, { startDate: { $gt: 0 } }]
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            contestId: { $toString: "$_id" },
                        }
                    },
                    {
                        $lookup: {
                            from: "roadkingqueens",
                            let: {
                                contestId: "$contestId",
                                type: "roadKing"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$contestId", "$$contestId"] } },
                                            { $expr: { $eq: ["$type", "$$type"] } },
                                        ]
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        kingMax: { $max: "$totalVotes" }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "roadkingqueens",
                                        let: {
                                            contestId: "$$contestId",
                                            type: "roadKing",
                                            kingMax: "$kingMax"
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $and: [
                                                        { $expr: { $eq: ["$contestId", "$$contestId"] } },
                                                        { $expr: { $eq: ["$type", "$$type"] } },
                                                        { $expr: { $eq: ["$totalVotes", "$$kingMax"] } },
                                                    ]
                                                }
                                            },
                                        ],
                                        as: "roadKingData"
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        data: "$roadKingData"
                                    }
                                }
                            ],
                            as: "roadKingData"
                        }
                    },
                    {
                        $lookup: {
                            from: "roadkingqueens",
                            let: {
                                contestId: "$contestId",
                                type: "roadQueen"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$contestId", "$$contestId"] } },
                                            { $expr: { $eq: ["$type", "$$type"] } },
                                        ]
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        queenMax: { $max: "$totalVotes" }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "roadkingqueens",
                                        let: {
                                            contestId: "$$contestId",
                                            type: "roadQueen",
                                            queenMax: "$queenMax"
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $and: [
                                                        { $expr: { $eq: ["$contestId", "$$contestId"] } },
                                                        { $expr: { $eq: ["$type", "$$type"] } },
                                                        { $expr: { $eq: ["$totalVotes", "$$queenMax"] } },
                                                    ]
                                                }
                                            },
                                        ],
                                        as: "roadQueenData"
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        data: "$roadQueenData"
                                    }
                                }

                            ],
                            as: "roadQueenData"
                        }
                    }
                ]);
                if (contestList.length == 0) {
                    flag = false;
                    break;
                }

                let contestWinner = contestList[0];
                // console.log("contestWinner", contestList);
                // console.log("roadKingData", contestWinner.roadKingData[0].data);
                // console.log("roadQueenData", contestWinner.roadQueenData[0].data);
                if (contestList.length > 0) {

                    await Contest.updateOne({ _id: contestWinner._id }, { $set: { isWinnerAnnounced: true } });

                    if (contestWinner.roadKingData.length > 0) {
                        let roadKingData = contestWinner.roadKingData[0].data;

                        for (let i = 0; i < roadKingData.length; i++) {
                            let contestWonKing = new ContestWon({
                                contestId: contestWinner._id,
                                userId: roadKingData[i].userId,
                                type: "roadKing"
                            });
                            await contestWonKing.save();
                            await User.updateOne({ _id: mongoose.Types.ObjectId(contestWonKing.userId) }, { $inc: { totalRewardPoint: 50 } });
                            let roadKingUser = await User.findOne({ _id: contestWonKing.userId });
                            if (roadKingUser && roadKingUser.deviceToken && roadKingUser.deviceToken !== "") {
                                let data = {
                                    contestName: contestWinner.title,
                                    id: contestWinner._id.toString(),
                                    senderId: "",
                                    receiverId: roadKingUser._id.toString()
                                };
                                sendFCM(roadKingUser.deviceToken, data, "winnerRoadKing");
                            }

                            let roadKingWinnerVoter = await RoadKingQueenVote.aggregate([
                                { $match: { roadKingQueenId: roadKingData[i]._id.toString() } },
                                {
                                    $addFields: {
                                        userId: { $toObjectId: "$userId" }
                                    }
                                },
                                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
                                {
                                    $project: {
                                        _id: 0,
                                        userDeviceToken: { $arrayElemAt: ["$userData.deviceToken", 0] }
                                    }
                                }
                            ]);

                            let regIds = [];
                            for (let index = 0; index < roadKingWinnerVoter.length; index++) {
                                if (roadKingWinnerVoter[index].userDeviceToken && roadKingWinnerVoter[index].userDeviceToken != "") {
                                    regIds.push(roadKingWinnerVoter[index].userDeviceToken);
                                }
                            }

                            // SEND FCM
                            if (regIds.length > 0) {
                                let data1 = {
                                    winnerName: roadKingUser.fullName,
                                    contestName: contestWinner.title,
                                };
                                let data = {
                                    title: formatter(config.get("notifications.winnerVoterTitle"), data1),
                                    message: formatter(config.get("notifications.winnerVoter"), data1),
                                    type: "winnerVoter",
                                    contestTitle: contestWinner.title,
                                    id: roadKingUser._id.toString()
                                };
                                sendMultipleFCM(regIds, data);
                            }
                        }
                    }

                    if (contestWinner.roadQueenData.length > 0) {

                        let roadQueenData = contestWinner.roadQueenData[0].data;
                        for (let i = 0; i < roadQueenData.length; i++) {
                            let contestWonQueen = new ContestWon({
                                contestId: contestWinner._id,
                                userId: roadQueenData[i].userId,
                                type: "roadQueen"
                            });
                            await contestWonQueen.save();
                            await User.updateOne({ _id: mongoose.Types.ObjectId(contestWonQueen.userId) }, { $inc: { totalRewardPoint: 50 } });

                            let roadQueenUser = await User.findById({ _id: contestWonQueen.userId });
                            if (roadQueenUser && roadQueenUser.deviceToken && roadQueenUser.deviceToken !== "") {
                                let data = {
                                    contestName: contestWinner.title,
                                    id: contestWinner._id.toString(),
                                    senderId: "",
                                    receiverId: roadQueenUser._id
                                };
                                sendFCM(roadQueenUser.deviceToken, data, "winnerRoadQueen");
                            }

                            let roadQueenWinnerVoter = await RoadKingQueenVote.aggregate([
                                { $match: { roadKingQueenId: roadQueenData[i]._id.toString() } },
                                {
                                    $addFields: {
                                        userId: { $toObjectId: "$userId" }
                                    }
                                },
                                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
                                {
                                    $project: {
                                        _id: 0,
                                        userDeviceToken: { $arrayElemAt: ["$userData.deviceToken", 0] }
                                    }
                                }
                            ]);
                            console.log("roadQueenWinnerVoter", roadQueenWinnerVoter);

                            let regIds = [];
                            for (let index = 0; index < roadQueenWinnerVoter.length; index++) {
                                if (roadQueenWinnerVoter[index].userDeviceToken && roadQueenWinnerVoter[index].userDeviceToken != "") {
                                    regIds.push(roadQueenWinnerVoter[index].userDeviceToken);
                                }
                            }

                            // SEND FCM
                            if (regIds.length > 0) {
                                let data1 = {
                                    winnerName: roadQueenUser.fullName,
                                    contestName: contestWinner.title,
                                };
                                let data = {
                                    title: formatter(config.get("notifications.winnerVoterTitle"), data1),
                                    message: formatter(config.get("notifications.winnerVoter"), data1),
                                    type: "winnerVoter",
                                    contestTitle: contestWinner.title,
                                    id: roadQueenUser._id.toString()
                                };
                                sendMultipleFCM(regIds, data);
                            }

                        }
                    }


                }
            }
            catch (Ex) {
                console.log(Ex);
            }

        }
        isContestCheckDone = true;
    }
}

var isCarnivalVoteCheckDone = true;
async function carnivalAttendesVotesReminder() {
    if (isCarnivalVoteCheckDone) {
        isCarnivalVoteCheckDone = false;
        let flag = true;
        while (flag) {
            try {
                let isSend = false;
                let currTime = Math.round(new Date() / 1000) - 47 * 60 * 60;
                let contestList = await Contest.aggregate([
                    {
                        $match: {
                            isAttendesVoteReminded: false,
                            startDate: { $lt: currTime }
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            carnivalId: { $toString: "$carnivalId" },
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            let: {
                                carnivalId: "$carnivalId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$carnivalId", "$$carnivalId"] } },
                                        ]
                                    }
                                },
                                { $sort: { insertDate: 1 } },
                                {
                                    $addFields: {
                                        userId: { $toObjectId: "$userId" }
                                    }
                                },
                                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
                                {
                                    $project: {
                                        _id: 0,
                                        userDeviceToken: { $arrayElemAt: ["$userData.deviceToken", 0] }
                                    }
                                }
                            ],
                            as: "memberData"
                        }
                    }
                ]);

                if (contestList.length == 0) {
                    flag = false;
                    break;
                }

                let contest = contestList[0];
                let member = contest.memberData;
                // console.log("contestList", contestList);
                await Contest.updateOne({ _id: contest._id }, { $set: { isAttendesVoteReminded: true } });

                let regIds = [];
                for (let index = 0; index < member.length; index++) {
                    if (member[index].userDeviceToken && member[index].userDeviceToken != "") {
                        regIds.push(member[index].userDeviceToken);
                    }
                }

                // SEND FCM
                if (regIds.length > 0) {
                    let data = {
                        title: config.get("notifications.voteReminderTitle"),
                        message: config.get("notifications.voteReminder"),
                        type: "voteReminder",
                        contestTitle: contest.title,
                        id: contest._id.toString()
                    };
                    sendMultipleFCM(regIds, data);
                }

            }
            catch (Ex) {
                console.log(Ex);
            }

        }
        isCarnivalVoteCheckDone = true;
    }
}

var isContestStartCheckDone = true;
async function contestCommencementReminder() {
    if (isContestStartCheckDone) {
        isContestStartCheckDone = false;
        let flag = true;
        while (flag) {
            try {
                let isSend = false;
                let currTime = Math.round(new Date() / 1000);
                let contestList = await Contest.aggregate([
                    {
                        $match: {
                            isContestStartCheck: false,
                            startDate: { $lte: currTime }
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            carnivalId: { $toString: "$carnivalId" },
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            let: {
                                carnivalId: "$carnivalId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$carnivalId", "$$carnivalId"] } },
                                        ]
                                    }
                                },
                                { $sort: { insertDate: 1 } },
                                {
                                    $addFields: {
                                        userId: { $toObjectId: "$userId" }
                                    }
                                },
                                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
                                {
                                    $project: {
                                        _id: 0,
                                        userDeviceToken: { $arrayElemAt: ["$userData.deviceToken", 0] }
                                    }
                                }
                            ],
                            as: "memberData"
                        }
                    }
                ]);

                if (contestList.length == 0) {
                    flag = false;
                    break;
                }

                let contest = contestList[0];
                let member = contest.memberData;
                // console.log("contestList", contestList);
                await Contest.updateOne({ _id: contest._id }, { $set: { isContestStartCheck: true } });

                let regIds = [];
                for (let index = 0; index < member.length; index++) {
                    if (member[index].userDeviceToken && member[index].userDeviceToken != "") {
                        regIds.push(member[index].userDeviceToken);
                    }
                }

                // SEND FCM
                if (regIds.length > 0) {
                    let data1 = {
                        contestName: contest.title
                    };
                    let data = {
                        title: formatter(config.get("notifications.contestCommencementTitle"), data1),
                        message: formatter(config.get("notifications.contestCommencement"), data1),
                        type: "contestCommencement",
                        id: contest._id.toString(),
                        contestTitle: contest.title,
                    };
                    sendMultipleFCM(regIds, data);
                }


            }
            catch (Ex) {
                console.log(Ex);
            }

        }
        isContestStartCheckDone = true;
    }
}

var isParticipationCheckDone = true;
async function participationReminder() {
    if (isParticipationCheckDone) {
        isParticipationCheckDone = false;
        let flag = true;
        while (flag) {
            try {
                let isSend = false;
                let currTime = Math.round(new Date() / 1000) - 22 * 60 * 60;
                let contestList = await Contest.aggregate([
                    {
                        $match: {
                            isParticipantReminded: false,
                            startDate: { $lt: currTime }
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            carnivalId: { $toString: "$carnivalId" },
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            let: {
                                carnivalId: "$carnivalId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$carnivalId", "$$carnivalId"] } },
                                        ]
                                    }
                                },
                                { $sort: { insertDate: 1 } },
                                {
                                    $addFields: {
                                        userId: { $toObjectId: "$userId" }
                                    }
                                },
                                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
                                {
                                    $project: {
                                        _id: 0,
                                        userDeviceToken: { $arrayElemAt: ["$userData.deviceToken", 0] }
                                    }
                                }
                            ],
                            as: "memberData"
                        }
                    }
                ]);

                if (contestList.length == 0) {
                    flag = false;
                    break;
                }

                let contest = contestList[0];
                let member = contest.memberData;
                // console.log("contestList", contestList);
                await Contest.updateOne({ _id: contest._id }, { $set: { isParticipantReminded: true } });

                let regIds = [];
                for (let index = 0; index < member.length; index++) {
                    if (member[index].userDeviceToken && member[index].userDeviceToken != "") {
                        regIds.push(member[index].userDeviceToken);
                    }
                }

                let carnivalName = await Carnival.findById(contest.carnivalId);
                // SEND FCM
                if (regIds.length > 0) {
                    let data1 = {
                        contestName: contest.title,
                        carnivalName: carnivalName.title
                    }
                    let data = {
                        title: formatter(config.get("notifications.carnivalAttendeesTitle"), data1),
                        message: formatter(config.get("notifications.carnivalAttendees"), data1),
                        type: "carnivalAttendees",
                        id: carnivalName._id.toString(),
                        contestTitle: ""
                    };
                    sendMultipleFCM(regIds, data);
                }

            }
            catch (Ex) {
                console.log(Ex);
            }

        }
        isParticipationCheckDone = true;
    }
}

module.exports.send3DaysBeforeReminder = send3DaysBeforeReminder;
module.exports.send1DaysBeforeReminder = send1DaysBeforeReminder;
module.exports.sendSameDaysBeforeReminder = sendSameDaysBeforeReminder;
module.exports.contestWon = contestWon;
module.exports.carnivalAttendesVotesReminder = carnivalAttendesVotesReminder;
module.exports.contestCommencementReminder = contestCommencementReminder;
module.exports.participationReminder = participationReminder;

