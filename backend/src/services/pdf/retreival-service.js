const { embedText } = require("../embedding-AI/embedding-service");
const mongoose = require("mongoose");
const Chunk = require("../../model/chunk.model");

async function retrieveRelevantChunks({ query, chatId, topK = 5 }) {
  const queryEmbedding = await embedText(query);

  // Fetch all chunks for this chat (no vector search needed)
  const chunks = await Chunk.find({ 
    chatId: new mongoose.Types.ObjectId(chatId) 
  }).select("text chunkIndex embedding");

  // Compute cosine similarity manually
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

  // Sort by score and return topK
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}


module.exports = { retrieveRelevantChunks };