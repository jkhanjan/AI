const Message = require('../model/message.model')
const Chat = require('../model/chat.model')
const { getContext } = require('./chatcontext.controller');
const { askAI } = require('../services/ai.services');

exports.createChat = async (req, res) => {
  const chat = await Chat.create({
    userId: req.user.id,
    title: "New Chat"
  });

  res.json(chat);
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    const chatsWithTitles = await Promise.all(
      chats.map(async (chat) => {
        const firstMessage = await Message.findOne({ 
          chatId: chat._id, 
          role: "user" 
        }).sort({ createdAt: 1 });

        return {
          ...chat.toObject(),
          title: firstMessage ? firstMessage.content.slice(0, 50) : chat.title
        };
      })
    );

    res.json({ data: chatsWithTitles });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChatById = async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  res.json(chat);
};
    
exports.addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.id;

    if (!content) return res.status(400).json({ message: "No content provided" });

    await Message.create({ chatId, role: "user", content });
    const context = await getContext(chatId, content);

    const reply = await askAI({ context });

    const assistantMessage = await Message.create({ chatId, role: "assistant", content: reply });

    res.json({ message: assistantMessage.content });

  } catch (error) {
    res.status(500).json({ message: "AI error when sending message", error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.id
  }).sort({ createdAt: 1 });

  res.json(messages);
};