import { MODELS } from "../config/model.config.mjs";
import { askAI } from "../services/ai.services.js";

export const techAgent = async (idea) => {
  const prompt = `
You are a senior software architect.

Based on this idea:
${idea}

Suggest:
- Tech stack
- Architecture
`;

  return await askAI({
    model: MODELS.REASONING,
    prompt
  });
};