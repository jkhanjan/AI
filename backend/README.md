# System Auth Backend

A Node.js + Express backend API for authenticated AI chat with multi-agent support and chat history management.

## Overview

This backend provides:
- **User Authentication** - Sign up, login with JWT tokens
- **AI Chat** - Single and multi-agent AI responses powered by Groq
- **Chat History** - Save and retrieve conversations per user
- **Data Logging** - Ingestion pipeline for tracking interactions

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **AI**: Groq SDK
- **Utilities**: CORS, dotenv, UUID, Axios

## Project Structure

```
backend/
├── index.js                      # Main server entry point
├── package.json                  # Dependencies
│
├── src/
│   ├── config/                   # Database & model configurations
│   ├── controllers/              # Request handlers (AI, Auth, Chat)
│   ├── middleware/               # Auth validation middleware
│   ├── model/                    # MongoDB schemas (User, Chat, Message)
│   ├── routes/                   # API endpoints
│   ├── services/                 # AI service logic (single/multi-agent)
│   └── agents/                   # AI agent implementations (idea, market, tech)
│
├── ingestion-pipeline/           # Data logging & ingestion
│   ├── routes/                   # Ingestion endpoints
│   ├── models/                   # Log schemas
│   └── middleware/               # Validation middleware
│
└── sdk/
    └── llmLogger.js              # LLM logging utilities
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login (returns JWT token)

### AI Chat
- `POST /ai/chat` - Send prompt to AI (single or multi-agent mode)

### Chat History
- `GET /ai/history` - Retrieve user's chat history
- `POST /ai/history` - Save chat session
- `DELETE /ai/history/:id` - Delete chat session

## Database Schema

### User
```
{
  email: String (unique, required),
  password: String (encrypted)
}
```

### Chat
```
{
  userId: ObjectId (ref: User),
  title: String,
  timestamps: (createdAt, updatedAt)
}
```

### Message
```
{
  chatId: ObjectId (ref: Chat),
  content: String,
  sender: String (user/ai)
}
```

## Getting Started

### Installation
```bash
npm install
```

### Environment Variables
Create `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
PORT=3000
REPO_READER_BASE_URL=https://repo-reader-gules.vercel.app/
```

### Environment

- Set `REPO_READER_BASE_URL` to point to the repo-reader service endpoint (defaults to `https://repo-reader-gules.vercel.app/`).


### Run Server
```bash
npm start
# or with nodemon
nodemon index.js
```

Server runs on `http://localhost:3000`

## Features

- **JWT Authentication** - Secure token-based auth
- **Password Encryption** - bcrypt for secure password storage
- **Multi-Agent AI** - Route prompts to specialized agents (idea, market, tech)
- **Single-Agent Mode** - Direct AI response for quick queries
- **CORS Enabled** - Frontend integration at `http://localhost:5173`
- **Request Logging** - Track interactions through ingestion pipeline

## AI Modes

- **Single Mode**: Direct response from primary AI agent
- **Multi Mode**: Parallel responses from multiple specialized agents

## Notes

- All AI routes require JWT authentication
- Chat history is tied to authenticated users
- Database timestamps automatically recorded for all chats
