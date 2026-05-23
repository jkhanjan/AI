use email: try1@try1.com , password: try123 for first time use login

# Project Name

A full-stack multi-turn AI chatbot platform built with Node.js, Express, MongoDB, and React.

The system supports:
- persistent conversations
- contextual chat memory
- pluggable LLM providers
- inference logging
- SDK-based observability
- ingestion pipelines for analytics

The architecture is designed to simulate how production-grade AI systems manage conversations, logging, and model interactions.

## Features

- Custom Authentication login/signup
- Multi-turn contextual conversations
- Persistent chat sessions
- Message history storage
- Lightweight context memory
- LLM provider abstraction layer
- SDK-based inference logging
- Structured ingestion pipeline
- MongoDB-backed persistence
- REST API architecture
- Scalable service-oriented backend

## System Architecture

Frontend (React)
      ↓
Backend API (Express.js)
      ↓
Authentication
      ↓
Chat Controller
      ↓
AI Service Layer
      ↓
LLM Provider (Groq.)

---------------------------------

LLM SDK Wrapper
      ↓
Inference Logs
      ↓
Ingestion API
      ↓
MongoDB

## Architecture Decisions

### 1. Service Layer Abstraction

The AI model interaction logic is isolated inside a dedicated service layer.

Reason:
- prevents controller bloat
- allows switching between LLM providers
- improves maintainability
- simplifies testing

---

### 2. Persistent Conversation Storage

Chats and messages are stored separately.

Reason:
- improves scalability
- enables efficient querying
- mimics real-world chat systems

---

### 3. Lightweight Context Window

Only recent messages are passed to the model instead of the full conversation history.

Reason:
- reduces token usage
- improves response latency
- prevents unnecessary context growth

---

### 4. SDK-Based Logging

A lightweight SDK wrapper captures inference metadata before responses are returned.

Reason:
- enables observability
- supports future analytics
- decouples logging from business logic

---

### 5. Ingestion Pipeline

Logs are processed through a dedicated ingestion layer before persistence.

Reason:
- separates raw logging from storage
- allows future batching/queueing
- improves extensibility for analytics pipelines

## Folder Structure

backend/
│
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
├── public/                  # Static assets
├── src/
│   ├── app/                 # App config & routing
│   ├── components/          # Shared UI components
│   ├── context/             # Global contexts
│   ├── features/
│   │   ├── auth/            # Authentication module
│   │   └── chat/            # Chat module
│   ├── lib/                 # Utilities & configs
│   ├── pages/               # Common pages
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md


## Context Management

The chatbot supports lightweight multi-turn memory.

For each request:
1. Recent messages are fetched from MongoDB
2. A limited context window is created
3. The context is sent to the LLM
4. The generated response is persisted

Currently, the system uses a rolling context strategy using the latest N messages.

This approach balances:
- conversational continuity
- token efficiency
- response speed

## LLM Abstraction Layer

The application uses a provider abstraction pattern.

The controller never directly interacts with the LLM provider.

Instead:
Controller → AI Service → Provider SDK

Benefits:
- easy provider swapping
- centralized model configuration
- reusable inference logic
- cleaner separation of concerns

## SDK Logging System

A lightweight SDK wrapper intercepts every LLM request.

The SDK captures:
- prompt
- response
- model name
- latency
- timestamps
- token metadata

This simulates production AI observability systems.

## Ingestion Pipeline

The ingestion layer receives logs from the SDK and processes them before storage.

Responsibilities:
- payload validation
- metadata extraction
- normalization
- persistence

This design separates:
application logic from analytics infrastructure.

## Tradeoffs & Limitations

### Current Limitations

- Context memory is limited to recent messages only
- No vector database integration yet
- No streaming responses
- Logging pipeline is synchronous
- No distributed queue system

### Why These Choices Were Made

The current implementation prioritizes:
- simplicity
- faster iteration
- modular architecture
- assignment completion speed

while keeping the system extensible for future scaling.

## Future Improvements

- Redis-based conversation caching
- Vector memory / RAG integration
- Streaming AI responses
- Async queue-based ingestion
- OpenTelemetry integration
- Multi-provider fallback routing
- Token analytics dashboard
- Rate limiting and auth hardening
