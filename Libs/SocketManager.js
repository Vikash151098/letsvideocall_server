"use strict";

const { User } = require("../models/user");
const { Chat } = require("../models/chat");
const mongoose = require("mongoose");
const { sendFCM } = require("../services/fcmModule");
//mongoose.set("debug", true);
exports.connectSocket = server => {
  if (!server.app) server.app = {};
  server.app.socketConnections = {};
  // console.log("Server Listner: ", server);
  let io = require("socket.io")(server);
  io.on("connection", async socket => {
    try {
      if (socket.handshake.query.userId && socket.id) {
        console.log(`New connection request by UserID: ${socket.handshake.query.userId} on socketId: ${socket.id}`);
        let dataToSet = { socketId: socket.id, isOnline: true, lastSeen: new Date() };
        let userId = socket.handshake.query.userId;
        //console.log("Complete DATA: ", server.app.socketConnections);
        if (server.app.socketConnections.hasOwnProperty(userId)) {
          for (let key in server.app.socketConnections) {
            if (
              server.app.socketConnections[key] &&
              server.app.socketConnections[key].userId &&
              server.app.socketConnections[key].userId === userId
            )
              delete server.app.socketConnections[key];
          }
          server.app.socketConnections[userId].socketId = socket.id;
          server.app.socketConnections[socket.id] = { userId: userId };
          // Update user status
          // User.updateOne({ _id: userId }, dataToSet);
          await User.updateOne(
            { _id: userId },
            { $set: { socketId: dataToSet.socketId, isOnline: dataToSet.isOnline, lastSeen: dataToSet.lastSeen } }
          );
          socket.broadcast.emit("isOnline", { isOnline: true, userId: userId });
        } else {
          for (let key in server.app.socketConnections) {
            if (
              server.app.socketConnections[key] &&
              server.app.socketConnections[key].userId &&
              server.app.socketConnections[key].userId === userId
            )
              delete server.app.socketConnections[key];
          }
          server.app.socketConnections[userId] = { socketId: socket.id };
          server.app.socketConnections[socket.id] = { userId: userId };
          await User.updateOne(
            { _id: userId },
            { $set: { socketId: dataToSet.socketId, isOnline: dataToSet.isOnline, lastSeen: dataToSet.lastSeen } }
          );
          socket.broadcast.emit("isOnline", { isOnline: true, userId: userId });
        }
        socket.on("sendMessage", async (chatdata, socketCallback) => {
          let dataToSave = {
            senderId: chatdata.senderId,
            receiverId: chatdata.receiverId,
            sentAt: chatdata.sentAt,
            message: chatdata.message,
            userName: chatdata.userName,
            type: chatdata.type,
            additionalData: chatdata.additionalData,
            conversationId: [chatdata.senderId, chatdata.receiverId].sort().join(".")
          };

          if (Number.isInteger(chatdata.sentAt) != true) {
            console.log("aa");
            return socket.emit("socketErr", {
              statusCode: 400,
              message: "Error while sending data.Please check",
              data: { chatdata }
            });
          }

          // console.log(dataToSave);

          if (!chatdata.senderId || !chatdata.receiverId || !chatdata.message) {
            return socket.emit("socketErr", {
              statusCode: 400,
              message: "Error while sending data.Please check",
              data: { chatdata }
            });
          }
          console.log("New message received: ", dataToSave);
          if (chatdata.message) dataToSave.message = chatdata.message;
          if (chatdata.image) dataToSave.image = chatdata.image;
          if (chatdata.type) dataToSave.type = chatdata.type;
          if (server.app.socketConnections && server.app.socketConnections.hasOwnProperty(chatdata.receiverId)) {
            console.log(
              `Sending emit to User:  ${chatdata.receiverId} at socketId: ${
              server.app.socketConnections[chatdata.receiverId].socketId
              }`
            );
            io.to(server.app.socketConnections[chatdata.receiverId].socketId).emit("sendMessage", chatdata);
            dataToSave.isDelivered = true;
            dataToSave.isRead = true;
            dataToSave.deliveredAt = new Date();
          } else {
            let sender = await User.findOne({ _id: chatdata.senderId });
            let receiver = await User.findOne({ _id: chatdata.receiverId });
            if (!receiver || !sender) {
              return socket.emit("socketErr", {
                statusCode: 400,
                message: "No userId found",
                data: {}
              });
            }
            let unreadCount = await Chat.find({ receiverId: chatdata.receiverId, isRead: false }).count();
            let senderId = chatdata.senderId.toString();
            let notificationData = {
              message: chatdata.message,
              type: "newMessage", // for front end
              senderId: senderId,
              profilePic: sender.profilePic,
              lastSeen: sender.lastSeen,
              isOnline: sender.isOnline,
              userName: sender.fullName,
              title: sender.username
              // badge: unreadCount
            };
            console.log("Receiver not connected, sending notification: ", notificationData);
            if (receiver.deviceToken && receiver.deviceToken != "") {
              sendFCM(receiver.deviceToken, notificationData, "newMessage");
            }
          }
          let chat = new Chat(dataToSave);
          let result = await chat.save();
        });
        socket.on("isTyping", async data => {
          /* expecting a json object  =>
                     {
                     senderId : ObjectId of Sender,
                     receiverId : ObjectId of Receiver
                     }
                     */
          if (server.app.socketConnections && server.app.socketConnections.hasOwnProperty(data.receiverId))
            io.to(server.app.socketConnections[data.receiverId ? data.receiverId : data.senderId].socketId).emit(
              "isTyping",
              data
            );
        });
        socket.on("isTypingStop", async data => {
          if (server.app.socketConnections && server.app.socketConnections.hasOwnProperty(data.receiverId))
            io.to(server.app.socketConnections[data.receiverId ? data.receiverId : data.senderId].socketId).emit(
              "isTypingStop",
              data
            );
        });
        socket.on("isSeen", async data => {
          /* expecting a json object  =>
                     {
                         senderId : ObjectId of Sender,
                         receiverId : ObjectId of Receiver
                     }
                     */
          if (server.app.socketConnections && server.app.socketConnections.hasOwnProperty(data.receiverId)) {
            io.to(server.app.socketConnections[data.receiverId ? data.receiverId : data.senderId].socketId).emit(
              "isSeen",
              data
            );
          }
          Chat.updateMany(
            { senderId: data.senderId, receiverId: data.receiverId, isRead: false, isDelivered: true },
            { $set: { isRead: true, readAt: new Date() } }
          );
        });
        socket.on("disconnect", async (data) => {
          if (server.app.socketConnections.hasOwnProperty(socket.id)) {
            console.log(
              `Disconnect Socket for User: ${server.app.socketConnections[socket.id].userId} and socketId: ${socket.id} due to: ${data}`
            );
            var userId = server.app.socketConnections[socket.id].userId;
            socket.broadcast.emit("isOnline", { isOnline: false, lastSeen: new Date(), userId: userId });
            await User.updateOne({ _id: userId }, { $set: { socketId: "", isOnline: false, lastSeen: new Date() } });
          }
          delete server.app.socketConnections[userId];
          delete server.app.socketConnections[socket.id];
        });
      } else {
        socket.emit("socketErr", {
          statusCode: 400,
          message: "No userId found",
          data: {}
        });
      }
    } catch (Ex) {
      console.log("Ex: ", Ex);
    }
  });
  exports.isOnline = data => {
    io.emit("isOnline", { isOnline: true, userId: data._id });
  };
};
