const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chunk = require("../../model/chunk.model");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });


async function embedText(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values; 
}

async function embedAndStoreChunks({ chunks, pdfId, chatId }) {
  const chunkDocs = [];

  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i];

    const embedding = await embedText(text);

    chunkDocs.push({
      pdfId,
      chatId,
      text,
      embedding,
      chunkIndex: i
    });

    await sleep(200);
  }

  await Chunk.insertMany(chunkDocs);
  // console.log(`Stored ${chunkDocs.length} chunks for pdfId: ${pdfId}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { embedText, embedAndStoreChunks };