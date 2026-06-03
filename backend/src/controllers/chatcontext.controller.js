const Message = require('../model/message.model');
const Chat = require('../model/chat.model');
const {retrieveRelevantChunks}  = require('../services/pdf/retreival-service');

async function getContext(chatId, userQuery) {
  const chat = await Chat.findById(chatId).lean();
  
  const messages = await Message.find({
    chatId,
    role: { $in: ["user", "assistant"] }
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  messages.reverse();
  const chatHistory = messages.map(({ role, content }) => ({ role, content }));

  if (!chat.pdfId) return chatHistory;

  const relevantChunks = await retrieveRelevantChunks({ query: userQuery, chatId });


  const pdfContext = relevantChunks
    .map((c, i) => `[Chunk ${i + 1}]:\n${c.text}`)
    .join("\n\n");

  const systemMessage = {
    role: "system",
    content: `Answer using this PDF context:\n\n${pdfContext}\n\nIf not in context, say you don't know.`
  };

  return [systemMessage, ...chatHistory];
}

module.exports = { getContext };