const Pdf = require("../../model/pdf.model");
const Chunk = require("../../model/chunk.model");
const { embedAndStoreChunks } = require("../embedding-AI/embedding-service");

function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];

  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);
    i += chunkSize - overlap; // slide window with overlap
  }

  return chunks;
}

async function processPdf(pdfId, rawText) {
  try {
    const chunks = chunkText(rawText);
    const pdf = await Pdf.findById(pdfId);

    await embedAndStoreChunks({ chunks, pdfId, chatId: pdf.chatId });

    await Pdf.findByIdAndUpdate(pdfId, { 
      status: "ready",
      totalChunks: chunks.length 
    });

  } catch (err) {
    await Pdf.findByIdAndUpdate(pdfId, { status: "failed" });
    throw err;
  }
}

module.exports = { processPdf, chunkText };