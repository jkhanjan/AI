const MODELS = {
  "qwen/qwen3.6-27b": {
    id: "qwen/qwen3.6-27b",
    for: ["simple"],
    supportsTools: true,
    provider: "groq"
  },
  "openai/gpt-oss-120b": {
    id: "openai/gpt-oss-120b",
    for: ["complex", "code", "tool-decision"],
    supportsTools: true,
    provider: "groq"
  },
  "openai/gpt-oss-120b": {
    id: "openai/gpt-oss-120b",
    for: ["reasoning", "math"],
    supportsTools: false, 
    provider: "groq"
  }
};

function getModelForTask(task) {  
  if (!task) return "openai/gpt-oss-120b";
  const match = Object.values(MODELS).find(m => m.for.includes(task));
  return match?.id || "openai/gpt-oss-120b";
}

function registerModel({ id, for: tasks, provider }) {
  MODELS[id] = { id, for: tasks, provider };
  console.log(`model registered: ${id} for tasks: ${tasks}`);
}

module.exports = { getModelForTask, registerModel };