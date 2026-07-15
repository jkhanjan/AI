const MODELS = {
  "llama-3.1-8b-instant": {
    id: "llama-3.1-8b-instant",
    for: ["simple"],
    supportsTools: true,
    provider: "groq"
  },
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
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
  if (!task) return "llama-3.3-70b-versatile";
  const match = Object.values(MODELS).find(m => m.for.includes(task));
  return match?.id || "llama-3.3-70b-versatile";
}

function registerModel({ id, for: tasks, provider }) {
  MODELS[id] = { id, for: tasks, provider };
  console.log(`model registered: ${id} for tasks: ${tasks}`);
}

module.exports = { getModelForTask, registerModel };