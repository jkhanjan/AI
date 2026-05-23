const Message = require('../model/message.model');

async function getContext(chatId) {
  const messages = await Message.find({ 
    chatId,
    role: { $in: ["user", "assistant"] }
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  messages.reverse();
  
  return messages.map(({ role, content }) => ({ role, content }));
}

module.exports = { getContext };