//var FCM = require("fcm-node");
var serverKey = require("../config/SoloMasFirebase.json");
const config = require("config");
const formatter = require("../services/commonFunctions");
var admin = require("firebase-admin");
const { Notification } = require('../models/notification');

// TBD
admin.initializeApp({
  credential: admin.credential.cert(serverKey),
  databaseURL: ""
});

//var fcm = new FCM(serverKey);
//const { Notification, validateNotificationGet, validateNotification } = require("../models/notification");

async function sendFCM(token, data, type) {
  var message = {};
  message.token = token;
  message.notification = {};
  message.android = {
    notification: {
      sound: "default"
    }
  };
  message.apns = {
    payload: {
      aps: {
        sound: "default",
        contentAvailable: true
      }
    }
  };

  //message.badge = "10";
  switch (type) {
    case "Admin":
      message.notification.title = data.title;
      message.notification.body = data.message;
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: "admin",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "likeFeed":
      message.notification.title = formatter(config.get("notifications.likeFeedTitle"), data);
      message.notification.body = formatter(config.get("notifications.likeFeed"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        id: data.id,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "commentFeed":
      message.notification.title = formatter(config.get("notifications.commentFeedTitle"), data);
      message.notification.body = formatter(config.get("notifications.commentFeed"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        id: data.id,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "likePhoto":
      message.notification.title = formatter(config.get("notifications.likePhotoTitle"), data);
      message.notification.body = formatter(config.get("notifications.likePhoto"), data);
      message.notification.image = data.photo;
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        id: data.id,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "commentPhoto":
      message.notification.title = formatter(config.get("notifications.commentPhotoTitle"), data);
      message.notification.body = formatter(config.get("notifications.commentPhoto"), data);
      message.notification.image = data.photo;
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        id: data.id,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "newMessage":
      message.notification.title = config.get("notifications.newMessageTitle");
      message.notification.body = formatter(config.get("notifications.newMessage"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        senderId: data.senderId,
        userName: data.userName,
        profilePic: data.profilePic,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "3DaysCarnivalReminder":
      message.notification.title = formatter(config.get("notifications.3DaysCarnivalReminderTitle"), data);
      message.notification.body = formatter(config.get("notifications.3DaysCarnivalReminder"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.questionId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "1DaysCarnivalReminder":
      message.notification.title = formatter(config.get("notifications.1DaysCarnivalReminderTitle"), data);
      message.notification.body = formatter(config.get("notifications.1DaysCarnivalReminder"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.questionId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "sameDaysCarnivalReminder":
      message.notification.title = formatter(config.get("notifications.sameDaysCarnivalReminderTitle"), data);
      message.notification.body = formatter(config.get("notifications.sameDaysCarnivalReminder"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.questionId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "chooseBand":
      message.notification.title = formatter(config.get("notifications.chooseBandTitle"), data);
      message.notification.body = formatter(config.get("notifications.chooseBand"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.questionId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "contestCommencement":
      message.notification.title = formatter(config.get("notifications.contestCommencementTitle"), data);
      message.notification.body = formatter(config.get("notifications.contestCommencement"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.questionId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "carnivalAttendees":
      message.notification.title = formatter(config.get("notifications.carnivalAttendeesTitle"), data);
      message.notification.body = formatter(config.get("notifications.carnivalAttendees"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.questionId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "voteReminder":
      message.notification.title = formatter(config.get("notifications.voteReminderTitle"), data);
      message.notification.body = formatter(config.get("notifications.voteReminder"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.questionId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "winnerRoadKing":
      message.notification.title = config.get("notifications.winnerRoadKingTitle");
      message.notification.body = formatter(config.get("notifications.winnerRoadKing"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.id,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "winnerRoadQueen":
      message.notification.title = config.get("notifications.winnerRoadQueenTitle");
      message.notification.body = formatter(config.get("notifications.winnerRoadQueen"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.id,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    case "winnerVoter":
      message.notification.title = formatter(config.get("notifications.winnerVoterTitle"), data);
      message.notification.body = formatter(config.get("notifications.winnerVoter"), data);
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: type,
        // id: data.questionId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
      break;
    default:
      message.notification.title = data.title;
      message.notification.body = data.message;
      message.data = {
        body: message.notification.body,
        title: message.notification.title,
        type: "default",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      };
  }
  //Save Notification

  console.log("Message: ", message);
  try {
    admin
      .messaging()
      .send(message)
      .then(response => {
        // Response is a message ID string.
        console.log("Successfully sent message:", response);
      })
      .catch(error => {
        console.log("Error sending message:", error);
      });
  } catch (Ex) {
    console.log("Error sending notifications: ", Ex);
  }
  // await admin.messaging().send(message, function(err, response) {
  //   if (err) {
  //     console.log("Something has gone wrong! ", err);
  //   } else {
  //     console.log("Successfully sent with response!", response);
  //   }
  //   return;
  // });

  // await fcm.send(message, function(err, response) {
  //   if (err) {
  //     console.log("Something has gone wrong! ", err);
  //   } else {
  //     console.log("Successfully sent with response!", response);
  //   }
  //   return;
  // });
  if (type !== "newMessage") {
    let saveNotifications = new Notification({
      message: message.notification.body,
      // createdAt: data.createdAt,
      title: message.notification.title,
      type: type,
      id: data.id,
      senderId: data.senderId,
      receiverId: data.receiverId
    });
    if (type === "Admin") {
      saveNotifications.adminNotification = true;
    }
    await saveNotifications.save();
  }
}

function sendMsgToTopic(message) {
  // Send a message to devices subscribed to the provided topic.
  admin
    .messaging()
    .send(message)
    .then(response => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch(error => {
      console.log("Error sending message:", error);
    });
}

// Subscribe the devices corresponding to the registration tokens to the topic.
function subscribeToTopic(registrationTokens, topic) {
  admin
    .messaging()
    .subscribeToTopic(registrationTokens, topic)
    .then(function (response) {
      console.log("Successfully subscribed to topic:", response);
    })
    .catch(function (error) {
      console.log("Error subscribing to topic:", error);
    });
}

async function sendMultipleFCM(registration_ids, data) {

  //console.log("In sendMultipleFCM: ", registration_ids)
  var message = {};
  message.tokens = registration_ids;
  message.notification = {};
  message.android = {
    "notification": {
      "sound": "default"
    }
  };
  message.apns = {
    "payload": {
      "aps": {
        "sound": "default",
        "contentAvailable": true
      }
    }
  }
  message.notification.title = data.title;
  message.notification.body = data.message;
  message.data = {
    body: message.notification.body,
    title: message.notification.title,
    type: data.type,
    id: data.id,
    contestTitle: data.contestTitle,
    click_action: "FLUTTER_NOTIFICATION_CLICK"
  };

  try {
    admin
      .messaging()
      .sendMulticast(message)
      .then(response => {
        // Response is a message ID string.
        console.log("Successfully sent message:", JSON.stringify(response));
      })
      .catch(error => {
        console.log("Error sending message:", JSON.stringify(error));
      });
  } catch (Ex) {
    console.log("Error sending notifications: ", Ex)
  }
}

// let token =
//   "c5qBPmIaHWA:APA91bGh1KBgTyWBic5WmgEBcKZ8O1NZ4pftrfrzTaSgv-IYfYpg9p6Alr0ycTPWQTFYSMkXP4P95EfxTK1i-SEbrIrYCGD8SxRrCX_DrqI0ius0zzu0z1PSt1YDLYzs0iL1eafTaGf3";
// let data1 = {
//   title: "test FCM",
//   message: "I hope you get this",
//   sourceMessageId: "0000000000",
//   questionId: "1111111111",
//   answerId: "2222222222",

// };
// //TYPE upvoteAnswer, newAnswer, commentAnswer, newMessage, directQuestion
// sendFCM(token, data1, "");

// setTimeout(() => {}, 2000);
// let data = {
//   title: "test FCM",
//   message: "I hope you get this"
// };
//sendFCM(token, data, "");

// setTimeout(() => {}, 2000);

module.exports.sendFCM = sendFCM;
module.exports.sendMsgToTopic = sendMsgToTopic;
module.exports.subscribeToTopic = subscribeToTopic;
module.exports.sendMultipleFCM = sendMultipleFCM;
