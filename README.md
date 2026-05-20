# 🤖 BuggyBot — Your Chaotic but Genius DSA AI Mentor

> **Master Data Structures & Algorithms without losing your mind.**

BuggyBot is a production-grade AI-powered full-stack web application that answers DSA questions strictly from **Grokking Algorithms by Aditya Bhargava** using **RAG (Retrieval-Augmented Generation)** architecture.

---

## ✨ Features

- 🧠 **AI Tutor** — Context-aware answers grounded in Grokking Algorithms
- 💬 **Streaming Chat** — ChatGPT-like streaming responses with typing animation
- 📚 **Source Citations** — Every answer cites chapter, page & excerpt
- ⚡ **Complexity Analyzer** — Big O analysis with best/average/worst cases
- 🎯 **Quiz Generator** — MCQs, flashcards & interview prep
- 📄 **PDF Upload** — Upload any DSA book and chat with it
- 🔐 **Auth System** — JWT with httpOnly cookies, register/login/logout
- 🌙 **Premium Dark UI** — Glassmorphism, gradients, Framer Motion animations

---

## 🏗️ Architecture

```
Frontend (Next.js 16)  →  Backend (Express.js)  →  AI Service (FastAPI)
     :3000                      :5000                      :8000
                                  ↓                           ↓
                              MongoDB                     ChromaDB
                           (Users/Chats)              (Vector Embeddings)
```

**AI Stack:** Gemini 1.5 Flash + text-embedding-004 + LangChain + ChromaDB

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)
- Google Gemini API key ([get free key](https://aistudio.google.com/app/apikey))

---

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/buggybot.git
cd buggybot
```

---

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run dev
```

Backend runs on **http://localhost:5000**

---

### 3. AI Service Setup

```bash
cd ai-service
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Place Grokking Algorithms PDF:
# Copy your PDF to: ai-service/data/grokking_algorithms.pdf

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

AI Service runs on **http://localhost:8000**
- Auto-loads Grokking Algorithms on first startup
- API docs at http://localhost:8000/docs

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

---

### 5. Environment Variables

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
GEMINI_API_KEY=your-gemini-api-key-here
CHROMA_DB_PATH=./chroma_db
PRELOAD_PDF_PATH=./data/grokking_algorithms.pdf
PRELOAD_COLLECTION_NAME=grokking_algorithms
```

---

## 🐳 Docker (All-in-One)

```bash
# Copy env files first
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
# Edit both .env files with your secrets

# Place PDF at: ai-service/data/grokking_algorithms.pdf

docker-compose up --build
```

All services start automatically. Visit **http://localhost:3000**

---

## 📁 Project Structure

```
BuggyBot/
├── frontend/          # Next.js 16 + React 19 + TypeScript + Tailwind v4
├── backend/           # Express.js + TypeScript + MongoDB + JWT
├── ai-service/        # FastAPI + LangChain + ChromaDB + Gemini
│   └── data/          # Place grokking_algorithms.pdf here
└── docker-compose.yml
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/chat` | Start new chat (SSE stream) |
| POST | `/api/chat/:id/message` | Continue chat (SSE stream) |
| GET | `/api/chat/history` | Get all chats |
| DELETE | `/api/chat/:id` | Delete chat |
| POST | `/api/upload/pdf` | Upload PDF |
| POST | `/api/ai/rag/chat` | Direct RAG query |

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4, Framer Motion, Zustand |
| Backend | Express.js, TypeScript, Mongoose, JWT, Zod |
| AI Service | FastAPI, LangChain, Gemini 1.5 Flash, ChromaDB, pdfplumber |
| Database | MongoDB, ChromaDB |
| DevOps | Docker, docker-compose |

---

## 🤖 Chat Modes

- **💬 Chat** — Ask anything about DSA from the book
- **🧠 Quiz** — Generate MCQs and practice problems
- **⚡ Complexity** — Get Big O analysis tables

---

Built with ❤️ using Next.js, FastAPI & Google Gemini
