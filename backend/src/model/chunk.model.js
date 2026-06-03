const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Pdf"
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Chat"
  },
  text: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  chunkIndex: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Chunk", chunkSchema);