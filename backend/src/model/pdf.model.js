const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Chat"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  filename: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["processing", "ready", "failed"],
    default: "processing"
  },
  pageCount: {
    type: Number
  },
  totalChunks: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model("Pdf", pdfSchema);