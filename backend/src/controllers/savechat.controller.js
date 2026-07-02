const Message = require('../model/message.model')
const Chat = require('../model/chat.model')
const { getContext } = require('./chatcontext.controller');
const { askAIStream  } = require('../services/ai.services');
const {getModelForTask} = require('../services/query-router/model-registry')
const {classifyQuery} = require('../services/query-router/classifier');
const { extractGithubUrl, analyzeRepoForChat } = require('../services/repo-reader/repoReader');

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

    const [context, task] = await Promise.all([
      getContext(chatId, content),
      classifyQuery(content)
    ]);

    let finalContext = context; 
    let analysisResult = null; 

    if (task === "repo") {
      const repoUrl = extractGithubUrl(content);

      if (repoUrl) {
        try {
          const analysis = await analyzeRepoForChat(repoUrl);
          analysisResult = analysis

          const prompt = `
            User Question:

            ${content}

            Repository Context:

            Summary:
            ${analysis.summary}

            Tech Stack:
            ${analysis.techStack.join(", ")}

            Architecture:
            ${analysis.architecture}

            Features:
            ${analysis.features.join(", ")}

            Instructions:

            Answer ONLY the user's question.

            Use the repository context when relevant.

            Do not simply summarize the repository unless the user asked for a summary.
            `;

          const repoSummaryMessage = {
            role: "system",
            content: prompt,
          };

          finalContext = [...context, repoSummaryMessage];
        } catch (err) {
          console.error("[repo-analysis] failed:", err.message);
          finalContext = [
            ...context,                                           
            { role: "system", content: `Note: attempted to analyze ${repoUrl} but the analysis failed.` },
          ];
        }
      }
    }

    const model = getModelForTask(task);
    const stream = await askAIStream({ context: finalContext, model });

    let fullReply = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullReply += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }
    if (analysisResult?.deepLink) {
      res.write(`data: ${JSON.stringify({ type: 'repo-link', url: analysisResult.deepLink })}\n\n`);
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