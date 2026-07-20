// evals/scripts/run_eval.ts
const BASE_URL = process.env.EVAL_BASE_URL || "http://localhost:3000";

async function createChat() {
  const res = await fetch(`${BASE_URL}/chats`, {         // adjust path/method to match yours
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: `eval-run-${Date.now()}` })
  });
  const data = await res.json();
  return data._id || data.chatId || data.id;      
}

async function runTestCase(testCase) {
  const chatId = await createChat();                     
  const response = await callChatApp(chatId, testCase.query);
  // ... score against testCase
}