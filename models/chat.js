const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Chats = new Schema({
  conversationId: { type: String, required: true },
  senderId: { type: String },
  receiverId: { type: String },
  type: { type: String, enum: ["audio", "image", "text", "video"] },
  additionalData: Object,
  message: { type: String, required: true },
  sentAt: { type: Number, required: true },
  isRead: { type: Boolean, default: false },
  blockBy: [{ type: String }],
  clearBy: [{ type: String }],
  readAt: { type: Date, sparse: true },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date, sparse: true },
  deletedBy: [{ type: String }]
});

Chats.index({
  conversationId: 1,
  senderId: 1,
  receiverId: 1,
  isRead: 1,
  isDelivered: 1
});

const Chat = mongoose.model("Chats", Chats);
module.exports.Chat = Chat;
