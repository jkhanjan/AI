const { embedText } = require("../embedding-AI/embedding-service");
const mongoose = require("mongoose");
const Chunk = require("../../model/chunk.model");
const { rerankChunks } = require("./reRankChunks");

async function retrieveRelevantChunks({ query, chatId, topK = 5 }) {
  const queryEmbedding = await embedText(query);

  const chunks = await Chunk.find({
    chatId: new mongoose.Types.ObjectId(chatId)
  }).select("text chunkIndex embedding");

  const cosineSimilarity = (a, b) => {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  };

  const scored = chunks.map(chunk => ({
    text: chunk.text,
    chunkIndex: chunk.chunkIndex,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  const topChunks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return await rerankChunks({
    query,
    chunks: topChunks
  });
}

module.exports = { retrieveRelevantChunks };