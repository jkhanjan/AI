import { MODELS } from "../config/model.config.mjs";
import { askAI } from "../services/ai.services.js";

export const ideaAgent = async (input) => {
  const prompt = `
You are an AI startup idea generator.

User Input:
${input}

Generate a unique AI product idea. 

`;

  return await askAI({
    model: MODELS.FAST,
    prompt
  });
};