const Message = require('../model/message.model');
const Chat = require('../model/chat.model');
const { retrieveRelevantChunks } = require('../services/pdf/retreival-service');
const { getOrUpdateSummary } = require('../services/summary/summary.service');

const RECENT_MSG_COUNT = 3;
const SUMMARY_THRESHOLD = 5; 

async function getContext(chatId, userQuery) {
  const chat = await Chat.findById(chatId).lean();
  const messages = await Message.find({
    chatId,
    role: { $in: ["user", "assistant"] }
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  messages.reverse();

  let summaryMsg = null;
  let recentMsgs = messages;

  if (messages.length > SUMMARY_THRESHOLD) {
    const olderMsgs = messages.slice(0, -RECENT_MSG_COUNT);
    recentMsgs = messages.slice(-RECENT_MSG_COUNT);

    const summary = await getOrUpdateSummary({ chat, olderMsgs });

    if (summary) {
      summaryMsg = {
        role: "system",
        content: `Summary of earlier conversation:\n${summary} in points and each point should be consise crisp and brief`
      };
    }
  }

  const chatHistory = recentMsgs.map(({ role, content }) => ({ role, content }));
  if (!chat.pdfId) {
    return [summaryMsg, ...chatHistory].filter(Boolean);
  }

  const relevantChunks = await retrieveRelevantChunks({ query: userQuery, chatId });

  const pdfContext = relevantChunks
    .map((c, i) => `[Chunk ${i + 1}]:\n${c.text}`)
    .join("\n\n");

  const systemMessage = {
    role: "system",
    content: `
  You are a PDF assistant.

  Use the provided PDF context to answer questions.

  If the user asks for a summary, overview, or what the document is about,
  generate a concise summary from the context.

  Only say "I don't know" when the answer cannot be determined from the context.

  PDF Context:
  ${pdfContext}
  `
  };

  return [systemMessage, summaryMsg, ...chatHistory].filter(Boolean);
}

module.exports = { getContext };