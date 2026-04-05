// services/ai.service.js
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.askAI = async ({ prompt, model }) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt || "hello",
      }
    ],
    model: model || "llama-3.3-70b-versatile",
  });

  return completion.choices[0].message.content;
};