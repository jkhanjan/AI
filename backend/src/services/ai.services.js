const Groq = require("groq-sdk");
const LLMLogger = require("../../sdk/llmLogger");
const DEFAULT_SYSTEM = "You are a helpful assistant.";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// exports.askAI = async ({ context, model }) => {
//   const logger = new LLMLogger({
//     provider: "groq",
//     model: model || DEFAULT_MODEL,
//   });

//   const { content } = await logger.call(
//     async () => {
//       const completion = await groq.chat.completions.create({
//         model: model || DEFAULT_MODEL,
//         messages: context,
//       });

//       return {
//         content: completion.choices[0].message.content,
//         usage: completion.usage,
//       };
//     },
//     { userMessage: context[context.length - 1]?.content || "" }
//   );

//   return content;
// };

exports.askAIStream = async ({ context, model }) => {
  const stream = await groq.chat.completions.create({
    model: model,
    messages: context,
    stream: true,
  });

  return stream;
};

exports.chat = async ({ prompt, systemPrompt, model }) => {
  const context = [
    { role: "system", content: systemPrompt || DEFAULT_SYSTEM },
    { role: "user", content: prompt },
  ];

  return await exports.askAI({ context, model });
};