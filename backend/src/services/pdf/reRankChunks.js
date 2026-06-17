const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function rerankChunks({ query, chunks, topK = 3 }) {
  try {
    const scoredChunks = await Promise.all(
      chunks.map(async (chunk) => {
        const response = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: `
                Score from 0-10 how relevant this chunk is to the query.

                Query: "${query}"

                Chunk:
                "${chunk.text}"

                Return only a number.
                            `,
                            },
                        ],
          temperature: 0,
          max_tokens: 5,
        });

        const score =
          parseFloat(response.choices?.[0]?.message?.content?.trim()) || 0;

        return {
          ...chunk,
          rerankScore: score,
        };
      })
    );

    return scoredChunks
      .sort((a, b) => b.rerankScore - a.rerankScore)
      .slice(0, topK);
  } catch (error) {
    console.error("Reranking failed:", error);
    return chunks.slice(0, topK); // fallback
  }
}

module.exports = {
  rerankChunks,
};