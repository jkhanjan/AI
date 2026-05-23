const Groq = require("groq-sdk");
const LLMLogger = require("../../sdk/llmLogger");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_SYSTEM = "You are a helpful assistant.";

exports.askAI = async ({ context, model }) => {
  const logger = new LLMLogger({
    provider: "groq",
    model: model || DEFAULT_MODEL,
  });

  const { content } = await logger.call(
    async () => {
      const completion = await groq.chat.completions.create({
        model: model || DEFAULT_MODEL,
        messages: context,
      });

      return {
        content: completion.choices[0].message.content,
        usage: completion.usage,
      };
    },
    { userMessage: context[context.length - 1]?.content || "" }
  );

  return content;
};

exports.chat = async ({ prompt, systemPrompt, model }) => {
  const context = [
    { role: "system", content: systemPrompt || DEFAULT_SYSTEM },
    { role: "user", content: prompt },
  ];

  return await exports.askAI({ context, model });
};