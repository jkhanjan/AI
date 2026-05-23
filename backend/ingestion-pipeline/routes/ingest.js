const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const { validateLogPayload } = require("../middleware/validate");

router.post("/", validateLogPayload, async (req, res) => {
  try {
    const {
      requestId,
      sessionId,
      conversationId,
      provider,
      model,
      status,
      errorMessage,
      latencyMs,
      startedAt,
      completedAt,
      usage,
      inputPreview,
      outputPreview,
    } = req.body;

    const parsedLog = {
      requestId,
      sessionId,
      conversationId: conversationId || null,
      provider: String(provider).toLowerCase(),
      model: String(model),
      status,
      errorMessage: errorMessage || null,
      latencyMs: Number(latencyMs),
      startedAt: new Date(startedAt),
      completedAt: new Date(completedAt),
      usage: {
        promptTokens: Number(usage?.promptTokens || 0),
        completionTokens: Number(usage?.completionTokens || 0),
        totalTokens: Number(usage?.totalTokens || 0),
      },
      inputPreview: inputPreview ? String(inputPreview).slice(0, 200) : null,
      outputPreview: outputPreview ? String(outputPreview).slice(0, 200) : null,
    };

    const log = new Log(parsedLog);
    await log.save();

    return res.status(201).json({
      success: true,
      message: "Log ingested successfully.",
      requestId,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Log already exists (duplicate requestId).",
      });
    }

    console.error("[Ingestion] Error saving log:", err.message);
    return res.status(500).json({ error: "Internal server error while saving log." });
  }
});


router.get("/logs", async (req, res) => {
  try {
    const { conversationId, sessionId, status, limit = 50 } = req.query;

    const filter = {};
    if (conversationId) filter.conversationId = conversationId;
    if (sessionId) filter.sessionId = sessionId;
    if (status) filter.status = status;

    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit), 200))
      .lean();

    return res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve logs." });
  }
});

module.exports = router;