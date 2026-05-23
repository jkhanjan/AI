const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  { _id: false }
);

const logSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    conversationId: { type: String, default: null, index: true },

    provider: { type: String, required: true },
    model: { type: String, required: true },

    // Performance
    latencyMs: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },

    // Outcome
    status: {
      type: String,
      enum: ["success", "error"],
      required: true,
      index: true,
    },
    errorMessage: { type: String, default: null },

    // Token usage
    usage: { type: usageSchema, default: () => ({}) },

    // Content previews (first 200 chars only)
    inputPreview: { type: String, default: null },
    outputPreview: { type: String, default: null },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
    collection: "llm_logs",
  }
);

module.exports = mongoose.model("Log", logSchema);