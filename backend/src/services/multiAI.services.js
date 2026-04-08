const { ideaAgent } = require("../agent/idea.agent");
const { marketAgent } = require("../agent/market.agent");
const { techAgent } = require("../agent/tech.agent");
const { askAI } = require("./ai.services.js");

// Multi Agent
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


exports.singleAI = async (prompt) => {
  try {
    return await askAI({prompt});
  } catch (error) {
    throw error;
  }
};