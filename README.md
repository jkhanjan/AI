# AI Chatbot Platform

A full-stack multi-turn AI chatbot platform built with Node.js, Express, MongoDB, and React.

> **Demo credentials** — email: `try1@try1.com` · password: `try123`

---

## What it does

- Persistent multi-turn conversations with contextual memory
- Pluggable LLM provider layer (currently Groq)
- SDK-based inference logging with a structured ingestion pipeline
- REST API backend with MongoDB persistence

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | MongoDB |
| LLM Provider | Groq |
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
       └── Chat Controller
              │
              ▼
       AI Service Layer
              │
              ▼
       LLM Provider (Groq)
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
├── routes/
├── middleware/
├── models/
├── sdk/
├── ingestion/
├── utils/
└── server.js

frontend/
├── public/
└── src/
    ├── app/
    ├── components/
    ├── context/
    ├── features/
    │   ├── auth/
    │   └── chat/
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

### 2. Persistent Conversation Storage
Chats and messages are stored in separate collections. This mirrors real-world chat systems and makes querying efficient as conversations grow.

---

### 3. Lightweight Context Window
Only the most recent N messages are passed to the model on each turn. This reduces token usage, lowers latency, and avoids unnecessary context growth.

---

### 4. SDK-Based Logging
A thin SDK wrapper around every LLM call captures prompt, response, model, latency, timestamps, and token counts — before the response is returned to the user. This decouples observability from business logic.

---

### 5. Ingestion Pipeline
Logs flow through a dedicated ingestion layer that validates, normalizes, and persists them. This keeps raw logging separate from storage and leaves room for batching or queuing later.

---

## Context Management

For each request:

1. Recent messages are fetched from MongoDB
2. A limited context window is built
3. Context is sent to the LLM
4. The response is persisted

The rolling window strategy balances conversational continuity, token efficiency, and response speed.

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

- Context is limited to recent messages only (no vector/RAG memory)
- Logging pipeline is synchronous
- No streaming responses
- No distributed queue for ingestion

These are intentional tradeoffs — the priority was a working, modular system over premature scaling.

---

## Future Improvements

- [ ] Redis-based conversation caching
- [ ] Vector memory / RAG integration
- [ ] Streaming AI responses
- [ ] Async queue-based ingestion (e.g. BullMQ)
- [ ] OpenTelemetry integration
- [ ] Multi-provider fallback routing
- [ ] Token analytics dashboard
- [ ] Rate limiting and auth hardening
