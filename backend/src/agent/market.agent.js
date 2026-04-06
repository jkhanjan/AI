import { askAI } from "../services/ai.services.js";
import { MODELS } from "../config/model.config.mjs";

export const marketAgent = async (idea) => {
  const prompt = `
You are a market researcher.

Analyze this idea:
${idea}

Tell:
- Demand
- Competitors
- Target users

`;

  return await askAI({
    model: MODELS.SMART,
    prompt
  });
};