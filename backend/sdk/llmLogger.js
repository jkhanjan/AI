const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const INGESTION_URL =
  process.env.INGESTION_URL || "http://localhost:4000/api/ingest";

class LLMLogger {
  constructor({ provider = "groq", model = "unknown", sessionId = null } = {}) {
    this.provider = provider;
    this.model = model;
    this.sessionId = sessionId || uuidv4(); 
  }
async call(llmCall, { conversationId, userMessage }) {
  
  const requestId = uuidv4();
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  let result = null;
  let status = "success";
  let errorMessage = null;
  let usage = {};

  try {
    result = await llmCall();
    usage = result.usage || {};
  } catch (err) {
    status = "error";
    errorMessage = err.message;
    throw err;
  } finally {
    const latencyMs = Date.now() - startMs;
    this._sendLog({ requestId, sessionId: this.sessionId, conversationId, provider: this.provider, model: this.model, status, errorMessage, latencyMs, startedAt, completedAt: new Date().toISOString(), usage: { promptTokens: usage.prompt_tokens || 0, completionTokens: usage.completion_tokens || 0, totalTokens: usage.total_tokens || 0 }, inputPreview: userMessage?.slice(0, 200), outputPreview: result?.content?.slice(0, 200) });
  }

  return { content: result?.content, usage, requestId };
}

  async _sendLog(payload) {
    try {
      await axios.post(INGESTION_URL, payload, {
        timeout: 3000,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("[LLMLogger] Failed to send log:", err.message);
    }
  }
}

module.exports = LLMLogger;