const Groq = require("groq-sdk");
const Chat = require("../../model/chat.model");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const SUMMARY_MODEL = "llama-3.1-8b-instant";

async function getOrUpdateSummary({ chat, olderMsgs }) {
  if (!olderMsgs.length) return chat.summary;

  const lastOldMsgId = olderMsgs[olderMsgs.length - 1]._id.toString();
  const alreadySummarized = chat.summarizedUpTo?.toString() === lastOldMsgId;

  if (alreadySummarized) return chat.summary

  const newMsgs = chat.summarizedUpTo
    ? olderMsgs.filter(m => m._id > chat.summarizedUpTo)
    : olderMsgs;

  if (!newMsgs.length) return chat.summary;

  const updatedSummary = await summarize({
    existingSummary: chat.summary,
    newMsgs
  });

  await Chat.findByIdAndUpdate(chat._id, {
    summary: updatedSummary,
    summarizedUpTo: lastOldMsgId
  });

  return updatedSummary;
}

async function summarize({ existingSummary, newMsgs }) {
  const formattedMsgs = newMsgs
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = existingSummary
    ? `You are a conversation summarizer.
Here is the existing summary:
"${existingSummary}"

New messages since then:
${formattedMsgs}

Update the summary to include the new messages. Be concise, preserve key facts, decisions, and context. Return only the updated summary text, nothing else.`: `You are a conversation summarizer.
Summarize the following conversation concisely. Preserve key facts, decisions, and context. Return only the summary text, nothing else.
${formattedMsgs}`;

  const response = await groq.chat.completions.create({
    model: SUMMARY_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3, 
    max_tokens: 512,
  });

  return response.choices[0].message.content.trim();
}

module.exports = { getOrUpdateSummary };