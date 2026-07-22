const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.EVAL_BASE_URL || "http://localhost:3000/ai/history";
const DATASET_PATH = path.join(__dirname, "..", "evals/dataset", "testcases.json");
const RESULTS_DIR = path.join(__dirname, "..", "evals/results"); 

async function createChat() {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: `eval-run-${Date.now()}` })
  });
  if (!res.ok) throw new Error(`createChat failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data._id || data.chatId || data.id;
}

async function attachPdfToChat(chatId, pdfId) {
  const res = await fetch(`${BASE_URL}/chat/${chatId}/pdf`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfId })
  });
  if (!res.ok) throw new Error(`attachPdfToChat failed: ${res.status} ${await res.text()}`);
}

// ─────────────────────────────────────────────
// 2. SSE call + buffering
// ─────────────────────────────────────────────

async function callChatApp(chatId, content) {
  const res = await fetch(`${BASE_URL}/chat/${chatId}/messages/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });

  if (!res.ok || !res.body) {
    throw new Error(`callChatApp failed: ${res.status} ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullReply = "";

  const collected = {
    task: null,
    model: null,
    retrievedChunks: [],
    toolsCalled: [],
    latencyMs: null,
    usage: null,
    error: null
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6);
      if (raw === "[DONE]") continue;

      let evt;
      try {
        evt = JSON.parse(raw);
      } catch {
        continue; // skip malformed chunks rather than crashing the whole run
      }

      if (evt.error) {
        collected.error = evt.error;
      } else if (evt.type === "meta") {
        collected.task = evt.task;
        collected.model = evt.model;
        collected.retrievedChunks = evt.retrievedChunks || [];
        collected.usage = evt.decisionUsage || collected.usage;
      } else if (evt.type === "tools") {
        collected.toolsCalled = evt.tools || [];
      } else if (evt.type === "done-meta") {
        collected.latencyMs = evt.latencyMs;
        if (evt.finalUsage) collected.usage = evt.finalUsage;
      } else if (evt.token) {
        fullReply += evt.token;
      }
    }
  }

  return { ...collected, answer: fullReply };
}

// ─────────────────────────────────────────────
// 3. Scoring helpers
// ─────────────────────────────────────────────

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function retrievalHit(retrievedChunks, expectedDocIds) {
  if (!expectedDocIds || expectedDocIds.length === 0) return null; // not applicable
  const retrievedIds = retrievedChunks.map(c => c.id);
  return expectedDocIds.every(id => retrievedIds.includes(id));
}

async function llmJudge(answer, goldenAnswer, rubric) {
  // Placeholder — plug in your own Groq/Anthropic call here.
  // Should return a 0-1 score based on rubric coverage.
  // Stubbed to null so it's obvious this isn't wired yet.
  return null;
}

// ─────────────────────────────────────────────
// 4. Per-test-case runner
// ─────────────────────────────────────────────

async function runTestCase(testCase) {
  const chatId = await createChat();

  if (testCase.pdfId) {
    await attachPdfToChat(chatId, testCase.pdfId);
  }

  const started = Date.now();
  let response;
  try {
    response = await callChatApp(chatId, testCase.query);
  } catch (err) {
    return {
      id: testCase.id,
      error: err.message,
      classification_correct: null,
      routing_correct: null,
      retrieval_hit: null,
      tools_correct: null,
      answer_score: null,
      latency_ms: Date.now() - started,
      token_usage: null,
      raw_answer: null
    };
  }

  const answerScore = testCase.golden_answer
    ? await llmJudge(response.answer, testCase.golden_answer, testCase.rubric)
    : null;

  return {
    id: testCase.id,
    error: response.error,
    classification_correct: testCase.category ? response.task === testCase.category : null,
    routing_correct: testCase.expected_route ? response.model === testCase.expected_route : null,
    retrieval_hit: retrievalHit(response.retrievedChunks, testCase.expected_doc_ids),
    tools_correct: testCase.expected_tools
      ? arraysEqual(response.toolsCalled, testCase.expected_tools)
      : null,
    answer_score: answerScore,
    latency_ms: response.latencyMs,
    token_usage: response.usage,
    raw_answer: response.answer
  };
}

// ─────────────────────────────────────────────
// 5. Main
// ─────────────────────────────────────────────

async function main() {
  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, "utf-8"));
  const results = [];

  for (const testCase of dataset) {
    console.log(`Running: ${testCase.id}`);
    const result = await runTestCase(testCase);
    results.push(result);

    if (result.error) {
      console.log(`  ⚠️  error: ${result.error}`);
    } else {
      console.log(`  classification=${result.classification_correct} routing=${result.routing_correct} retrieval=${result.retrieval_hit} tools=${result.tools_correct} latency=${result.latency_ms}ms`);
    }
  }

  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const outPath = path.join(RESULTS_DIR, `run_${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} results → ${outPath}`);
}

main().catch(err => {
  console.error("Eval run failed:", err);
  process.exit(1);
});