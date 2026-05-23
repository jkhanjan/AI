const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },

  title: {
    type: String,
    default: "New Chat"
  }

}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);