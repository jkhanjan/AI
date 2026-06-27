const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function classifyQuery(query) {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{
      role: "user",
      content: `Classify this query into one of: simple, complex, pdf, code, repo.
            simple: greetings, one-word answers, basic facts.
            complex: reasoning, analysis, multi-step questions.
            pdf: questions about a document or its content.
            code: writing, debugging, or explaining code.
            repo: contains a GitHub repository URL, or asks to analyze/explain a GitHub repo.
            Query: "${query}"
            Return only the category word, nothing else.`
    }],
    temperature: 0,
    max_tokens: 5
  });

  const label = response.choices[0].message.content.trim().toLowerCase();
  const valid = ["simple", "complex", "pdf", "code", "repo"];
  return valid.includes(label) ? label : "complex";
}

module.exports = { classifyQuery };