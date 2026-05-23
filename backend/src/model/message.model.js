const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Chat"
  },

  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true
  },

  content: {
    type: String,
    required: true
  },

  agent: {
    type: String,
    default: "main"
  }

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);