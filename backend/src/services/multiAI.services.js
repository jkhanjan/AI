const { ideaAgent } = require("../agent/idea.agent");
const { marketAgent } = require("../agent/market.agent");
const { techAgent } = require("../agent/tech.agent");

exports.multiAI = async (prompt) => {
  try {
    const [idea, marketing, tech] = await Promise.all([
      ideaAgent(prompt),
      marketAgent(prompt),
      techAgent(prompt)
    ]);

    return {
      idea,
      marketing,
      tech
    };
    
  } catch (error) {
    throw error;
  }
};