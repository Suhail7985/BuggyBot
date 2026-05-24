# BuggyBot — AI-Powered DSA Learning Assistant

> **Professional AI tutoring for data structures, algorithms, and debugging.**

BuggyBot is a full-stack learning assistant built with **Next.js**, **TypeScript**, **Express.js**, and the **OpenAI API**. It helps users understand debugging concepts, algorithms, and DSA problems with context-aware, streaming responses grounded in uploaded textbooks (e.g. *Grokking Algorithms*) via **RAG**.

---

## Features

- **Interactive chat** — ChatGPT-style streaming UI for DSA questions
- **OpenAI integration** — Context-aware tutoring with `gpt-4o-mini` + embeddings
- **RAG pipeline** — ChromaDB retrieval with chapter/page citations
- **Quiz & complexity modes** — MCQs and Big O analysis
- **PDF upload** — Chat with your own DSA books
- **Auth** — JWT in httpOnly cookies (register / login / saved history)
- **CI/CD** — GitHub Actions for build/test; Vercel for frontend deploy

---

## Architecture

```
Frontend (Next.js)  →  Backend (Express.js)  →  AI Service (FastAPI)
     :3000                      :5000                      :8000
                                  ↓                           ↓
                              MongoDB                     ChromaDB
                           (Users/Chats)              (Vector Embeddings)
```

**Tech stack:** Next.js, TypeScript, React, Node.js, Express.js, REST APIs, OpenAI API, GitHub Actions, Vercel, FastAPI, LangChain, ChromaDB

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — MongoDB URI, JWT secrets
npm install
npm run dev
```

Runs at **http://localhost:5000**

### 2. AI Service

```bash
cd ai-service
cp .env.example .env
# Add OPENAI_API_KEY to .env
# Optional: place grokking_algorithms.pdf in ai-service/data/

python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Runs at **http://localhost:8000** · API docs at `/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local   # optional; defaults to localhost
npm install
npm run dev
```

Runs at **http://localhost:3000**

- **Landing demo** — try chat on `/` without signing in
- **Full app** — register, then use `/dashboard` for saved chats

---

## Environment Variables

**backend/.env**

```env
MONGODB_URI=mongodb://localhost:27017/buggybot
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
PORT=5000
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

**ai-service/.env**

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
CHROMA_DB_PATH=./chroma_db
PRELOAD_COLLECTION_NAME=grokking_algorithms
```

**frontend/.env.local** (production / Vercel)

```env
BACKEND_URL=https://your-backend.example.com
AI_SERVICE_URL=https://your-ai-service.example.com
```

---

## Deployment (Vercel + CI/CD)

| Step | Platform |
|------|----------|
| Frontend | **Vercel** (root dir: `frontend`) |
| API + AI | **Render** via `render.yaml` |
| Database | **MongoDB Atlas** |

Full guide: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

**Quick Vercel env vars:**

```env
BACKEND_URL=https://your-api.onrender.com
AI_SERVICE_URL=https://your-ai.onrender.com
```

GitHub Actions: **CI** on every PR/push · **Deploy to Vercel** on `main` (optional secrets).

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/profile` | Update profile |
| POST | `/api/chat` | New chat (SSE) |
| POST | `/api/chat/:id/message` | Continue chat (SSE) |
| GET | `/api/chat/history` | List chats |
| POST | `/api/upload/pdf` | Upload PDF |
| POST | `/api/rag/chat` | Direct RAG stream (AI service) |

---

## Project Structure

```
BuggyBot/
├── frontend/          # Next.js 16 + React 19 + TypeScript
├── backend/           # Express.js + MongoDB + JWT
├── ai-service/        # FastAPI + OpenAI + ChromaDB
├── .github/workflows/ # CI + optional Vercel deploy
└── docker-compose.yml
```

---

## Docker

```bash
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
docker-compose up --build
```

---

Built with Next.js, Express.js, and OpenAI.
