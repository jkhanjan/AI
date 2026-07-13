const { Groq } = require('groq-sdk/client.js');
const Message = require('../model/message.model')
const Chat = require('../model/chat.model')
const { getContext } = require('./chatcontext.controller');
const { askAIStream  } = require('../services/ai.services');
const {getModelForTask} = require('../services/query-router/model-registry')
const {classifyQuery} = require('../services/query-router/classifier');
const { extractGithubUrl, analyzeRepoForChat } = require('../services/repo-reader/repoReader');
const { executeTool } = require('../services/tools/executor');
const { tools } = require('../services/tools/schema');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    
// exports.addMessage = async (req, res) => {
//   try {
//     const { content } = req.body;
//     const chatId = req.params.id;

//     if (!content) return res.status(400).json({ message: "No content provided" });

//     await Message.create({ chatId, role: "user", content });
//     const context = await getContext(chatId, content);

//     const reply = await askAI({ context });

//     const assistantMessage = await Message.create({ chatId, role: "assistant", content: reply });

//     res.json({ message: assistantMessage.content });

//   } catch (error) {
//     res.status(500).json({ message: "AI error when sending message", error: error.message });
//   }
// };


exports.addMessageStream = async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.id;
    if (!content) return res.status(400).json({ message: "No content provided" });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    await Message.create({ chatId, role: "user", content });

    const context = await getContext(chatId, content);
    const task = await classifyQuery(content); 
    const model = getModelForTask(task);

    const messages = [
      { role: "system", content: "If the user asks about a specific GitHub repository (by URL or referenced from earlier context), use the analyze_github_repo tool before answering." },
      ...context,
      { role: "user", content }
    ];

    const decision = await groq.chat.completions.create({
      model,
      messages,
      tools,
      tool_choice: "auto"
    });
    console.log("[usage]", decision.usage); 


    const decisionMsg = decision.choices[0].message;
    const toolCalls = decisionMsg.tool_calls;
    let deepLink = null;

    if (toolCalls && toolCalls.length) {
      messages.push(decisionMsg);

      for (const call of toolCalls) {
        res.write(`data: ${JSON.stringify({ type: 'status', message: `Running ${call.function.name}...` })}\n\n`);

        try {
          const { result, deepLink: link } = await executeTool(call);
          if (link) deepLink = link;

          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result)
          });
        } catch (err) {
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({ error: `Tool execution failed: ${err.message}` })
          });
        }
      }
    }

   const stream = await groq.chat.completions.create({
      model,
      messages,
      stream: true
    });

    let fullReply = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullReply += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    if (deepLink) {
      res.write(`data: ${JSON.stringify({ type: 'repo-link', url: deepLink })}\n\n`);
    }

    await Message.create({ chatId, role: "assistant", content: fullReply });
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.id
  }).sort({ createdAt: 1 });

  res.json(messages);
};