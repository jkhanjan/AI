# AI Chatbot Platform

A full-stack, multi-turn AI chatbot platform with retrieval-augmented generation, LLM-based reranking, rolling conversation summarization, and an integrated GitHub repo analysis agent — built with Node.js, Express, MongoDB, Next.js, and LangGraph.

> **Demo credentials** — email: `try1@try1.com` · password: `try123`

---

## What it does

- Persistent multi-turn conversations with contextual memory
- Retrieval-augmented generation over uploaded PDFs (cosine similarity search)
- LLM-based reranking of retrieved chunks before they reach the context window
- Rolling conversation summarization — replaces old turns instead of truncating them
- Real-time streaming responses over SSE with a typewriter effect on the frontend
- Automatic GitHub repo detection inside chat — routes to a LangGraph-powered repo analysis agent and folds the analysis back into the conversation context
- Deep linking from chat into the repo reader UI, with state hydrated from URL query params
- Pluggable LLM provider layer (currently Groq), with query-based routing across models
- SDK-based inference logging with a structured ingestion pipeline

---

## Tech Stack

| Layer | Tech |
|---|---|
| Chat Frontend | React, Vite |
| Repo Reader Frontend | Next.js, TypeScript |
| Chat Backend | Node.js, Express |
| Agentic Workflows | LangGraph |
| Database | MongoDB |
| LLM Provider | Groq |
| Retrieval | Custom embeddings + cosine similarity (Atlas free-tier fallback — no native vector search) |
| Reranking | LLM-based reranker (Groq call over top-K candidates) |
| Streaming | Server-Sent Events (SSE) |
| Auth | Custom JWT |

---

## System Architecture

```
Frontend (React)
       │
       ▼
Backend API (Express)
       │
       ├── Authentication
       │
       ├── GitHub URL Detector ──────────► Repo Reader Service (Next.js + LangGraph)
       │                                          │
       │                                          ▼
       │                                   Repo Analysis Result
       │                                          │
       │        ◄─────────────────────────────────┘
       │        (folded into LLM context)
       ▼
   Chat Controller
       │
       ▼
   AI Service Layer
       │
       ├── Context Assembly
       │      ├── Rolling Summary (replaces old messages)
       │      └── RAG Retrieval → LLM Reranker → Top Chunks
       │
       ▼
   LLM Provider (Groq, query-routed)
       │
       ▼
   SSE Stream ──► Frontend (useTypewriter)
```

```
LLM SDK Wrapper
       │
       ▼
  Inference Logs
       │
       ▼
  Ingestion API
       │
       ▼
    MongoDB
```

---

## Folder Structure

```
backend/
├── controllers/
├── services/
│   ├── ai/                # provider routing, prompt assembly
│   ├── rag/                # embedding, cosine retrieval, reranker
│   ├── summary/             # rolling summary compression
│   └── repoReader/          # GitHub URL detection + client for repo service
├── routes/
├── middleware/
├── models/
├── sdk/
├── ingestion/
├── utils/
└── server.js

repo-reader/                 # Next.js app, LangGraph agent
├── app/
│   └── api/
│       └── analyze/
├── lib/
│   └── langgraph/           # sufficiency-loop agent definition
└── components/

frontend/
├── public/
└── src/
    ├── app/
    ├── components/
    ├── context/
    ├── features/
    │   ├── auth/
    │   └── chat/
    ├── hooks/
    │   └── useTypewriter.js
    ├── lib/
    ├── pages/
    ├── App.jsx
    └── main.jsx
```

---

## Key Design Decisions

### 1. Service Layer Abstraction
LLM interaction logic lives in a dedicated service layer — the controller never talks to the provider directly.

```
Controller → AI Service → Provider SDK
```

This makes it easy to swap providers, keeps controllers clean, and centralizes model configuration.

---

### 2. RAG with Cosine Similarity Fallback
Uploaded PDFs are chunked and embedded, then retrieved via cosine similarity rather than a managed vector index. This was a deliberate fallback after discovering MongoDB Atlas's free (M0) tier doesn't support Atlas Vector Search — so retrieval is computed directly against stored embeddings instead of relying on a native index.

---

### 3. LLM-Based Reranking
Top-K candidates from cosine retrieval are re-scored by a dedicated Groq call before being inserted into the prompt. This catches cases where embedding similarity alone surfaces chunks that are topically close but not actually the most useful for the query.

---

### 4. Rolling Summary Replaces Old Context (RAG Stays Additive)
Conversation history is compressed into a rolling summary that **replaces** older raw messages once the window fills up, keeping token usage bounded regardless of conversation length. RAG-retrieved document chunks are layered on top of this summary rather than competing with it for space — summary covers "what's been discussed," retrieval covers "what's in the documents."

---

### 5. Streaming Responses
Responses stream token-by-token over SSE and render through a `useTypewriter` hook on the frontend, rather than waiting for the full completion.

---

### 6. Integrated Repo Reader Agent
GitHub URLs typed into chat are detected automatically and routed to a separate Next.js service that runs a LangGraph agent over the repo. This is framed as a shift from a fixed-pipeline RAG lookup to an **agent with a stopping condition** — the agent loops (fetch → analyze → decide if it has enough) until it judges the analysis sufficient, rather than running a fixed number of retrieval steps. The result is folded back into the main chat's LLM context, and the frontend deep-links into the repo reader UI with state hydrated from URL query params so a user can jump from a chat answer straight into the full repo view.

---

### 7. SDK-Based Logging
A thin SDK wrapper around every LLM call captures prompt, response, model, latency, timestamps, and token counts — before the response is returned to the user. This decouples observability from business logic.

---

### 8. Ingestion Pipeline
Logs flow through a dedicated ingestion layer that validates, normalizes, and persists them. This keeps raw logging separate from storage and leaves room for batching or queuing later.

---

## Context Management

For each request:

1. Recent messages are fetched from MongoDB; anything beyond the window is folded into the rolling summary
2. The query is embedded and matched against stored document chunks via cosine similarity
3. Retrieved chunks are reranked by an LLM call, and the top results are kept
4. Summary + reranked chunks + recent messages are assembled into the final context
5. Context is streamed to the LLM over SSE
6. The response is persisted, and the log entry is sent to the ingestion pipeline

---

![Alt text](./RAG-flo.png)

## Repo Reader Integration Flow

1. User pastes or mentions a GitHub URL in chat
2. Backend detects the URL and calls the repo reader service's analysis API
3. The LangGraph agent fetches repo contents and loops until its own sufficiency check passes
4. The analysis is returned and injected into the chat's LLM context
5. The chat response streams back with the repo insight included
6. A deep link is generated so the user can open the full repo reader view, with query params hydrating the same analysis state on load

---

## Ingestion Pipeline

The ingestion service runs on port `4000` and exposes:

| Endpoint | Method | Description |
|---|---|---|
| `/api/ingest` | POST | Ingest a single LLM log |
| `/api/ingest/logs` | GET | Query logs with filters |

Filters available on GET: `status`, `sessionId`, `conversationId`, `limit`.

---

## Limitations

- Retrieval is cosine-similarity over stored embeddings, not a managed vector index — fine at current scale, won't scale indefinitely
- Reranking adds an extra LLM round-trip per query, which adds latency
- Logging pipeline is synchronous
- No distributed queue for ingestion
- Repo reader analysis quality depends on the LangGraph agent's own stopping heuristic — no hard guarantee of completeness

These are intentional tradeoffs — the priority was a working, modular system over premature scaling.

---

## Future Improvements

- [ ] Move retrieval to a managed vector DB (or upgrade Atlas tier) once corpus size demands it
- [ ] Redis-based conversation caching
- [ ] Async queue-based ingestion (e.g. BullMQ)
- [ ] OpenTelemetry integration
- [ ] Multi-provider fallback routing
- [ ] Token analytics dashboard covering reranker + repo-agent calls separately
- [ ] Rate limiting and auth hardening
- [ ] Cache repeated repo analyses to avoid re-running the LangGraph loop on the same repo