# BuggyBot — AI-Powered DSA Learning Assistant

> A full-stack AI tutor for data structures, algorithms, debugging, and interview-style problem solving.

BuggyBot combines a **Next.js** frontend, an **Express.js** backend, and a **FastAPI** AI service to deliver a complete learning experience. Users can chat with a streaming AI tutor, upload PDFs, save chat history, and get grounded answers with citations from a local RAG pipeline.

## What BuggyBot does

- **Explain DSA and debugging concepts** with clear, interactive AI-generated answers
- **Run a live demo chat** on the landing page without login
- **Provide authenticated chats** with saved history and profile management
- **Upload PDFs** and ask questions about your own notes or textbooks
- **Show citations** from indexed content when the AI uses RAG
- **Support quiz and complexity analysis** flows for study and revision
- **Use production-ready deployment** on Vercel + Render with CI/CD

## Project highlights

1. **Interactive learning UI** — polished landing page, demo chat, authenticated dashboard, chat history, upload flow, and settings.
2. **Live backend + AI integration** — frontend rewrites proxy requests to the hosted Render backend and AI service.
3. **Production stack** — TypeScript across the app, FastAPI + ChromaDB/RAG for retrieval, Express.js + MongoDB for user data, and GitHub Actions/Vercel for deployment.

## Tech stack

### Frontend
- **Next.js 16** with **React 19** and **TypeScript**
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **Zustand** for lightweight client state
- **Framer Motion** for UI transitions
- **Lucide React** for icons
- **React Markdown + remark-gfm** for formatted AI responses
- **Next.js middleware** for auth redirects and API rewrites

### Backend
- **Node.js 20+**
- **Express.js** with TypeScript
- **MongoDB + Mongoose** for user, chat, and document metadata
- **JWT** in `httpOnly` cookies for auth
- **bcryptjs** for password hashing
- **cookie-parser**, **helmet**, **cors**, **morgan**
- **rate limiting** for auth, chat, and API routes
- **multer** for PDF upload handling
- **Zod** for request validation

### AI Service
- **FastAPI**
- **Uvicorn** for ASGI serve
- **Python 3.11+**
- **OpenAI** and **Google Generative AI** libraries
- **LangChain** + **LangChain OpenAI** + **LangChain Google GenAI**
- **ChromaDB** for vector storage
- **PyPDF / pdfplumber** for PDF extraction
- **pydantic** for request/response models
- **Streaming SSE responses** for token-by-token chat output

### DevOps / deployment
- **GitHub Actions** for CI/build checks
- **Vercel** for frontend deployment
- **Render** for backend and AI service deployment
- **MongoDB Atlas** for database
- **Docker Compose** for local multi-service development

## Architecture

```
Frontend (Next.js) -> Backend API (Express.js) -> AI Service (FastAPI)
         |                       |                       |
         |                       |                       +--> ChromaDB
         |                       +--> MongoDB
         +--> API rewrites to hosted Render services
```

### Data flow
1. User opens the frontend and uses the demo chat or authenticated app.
2. Frontend calls `/api/backend/*` or `/api/ai/*` routes.
3. Next.js rewrites proxy these to the hosted backend and AI service.
4. The backend handles auth, user data, chat persistence, and uploads.
5. The AI service performs RAG, PDF extraction, vector search, and streaming completion.
6. Responses are returned to the frontend with citations and chat updates.

## Features in detail

### Frontend features
- Landing page with demo chat and feature highlights
- Login / register pages with auth state
- Dashboard for saved chats and account access
- Chat page with streaming responses
- Upload page for PDF documents
- Settings page for profile management
- Responsive UI with modern Tailwind styling

### Backend features
- User registration, login, refresh, and profile updates
- JWT auth with secure cookies
- Chat creation and message history APIs
- Upload API for PDFs
- Rate limiting and error handling
- CORS and environment-based config

### AI service features
- Chat streaming endpoint for conversational answers
- RAG search and retrieval over indexed content
- PDF processing and chunking pipelines
- ChromaDB preload support for default collections
- Health endpoint for deployment checks
- Support for OpenAI and Gemini-backed LLM selection

## Current live endpoints

- **Frontend (local dev):** `http://localhost:3000`
- **Backend (local dev):** `http://localhost:5000`
- **AI service (local dev):** `http://localhost:8000`
- **Hosted backend:** `https://buggybot-api.onrender.com`
- **Hosted AI service:** `https://buggybot-ai.onrender.com`

## Project structure

```
BuggyBot/
├── frontend/               # Next.js 16 + TypeScript UI
│   ├── src/app/            # App router pages
│   ├── src/components/     # Reusable UI/components
│   ├── src/services/       # API clients
│   ├── src/store/          # Auth + chat state
│   └── next.config.ts      # API rewrites to backend/AI service
├── backend/                # Express.js API
│   ├── src/server.ts       # App entrypoint
│   ├── src/routes/         # Auth, chat, upload routes
│   ├── src/controllers/    # Route handlers
│   ├── src/models/         # MongoDB schemas
│   └── src/middleware/     # Auth, errors, rate limiting
├── ai-service/             # FastAPI AI/RAG service
│   ├── main.py             # App entrypoint
│   ├── routers/            # RAG and PDF endpoints
│   ├── services/           # LLM, embeddings, vector store, RAG chain
│   ├── models/             # Request/response schemas
│   └── requirements.txt    # Python dependencies
├── .github/workflows/      # CI and deployment workflows
├── DEPLOYMENT.md           # Production deployment guide
├── docker-compose.yml      # Local multi-service compose setup
└── README.md               # Main project documentation
```

## Local development

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB Atlas or local MongoDB
- One of:
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2. AI service

```bash
cd ai-service
cp .env.example .env
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 4. Docker (optional)

```bash
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
docker-compose up --build
```

## Environment variables

### Backend

```env
MONGODB_URI=mongodb://localhost:27017/buggybot
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
PORT=5000
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### AI service

```env
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENAI_MODEL=gpt-4o-mini
GEMINI_MODEL=gemini-2.5-flash
CHROMA_DB_PATH=./chroma_db
PRELOAD_COLLECTION_NAME=grokking_algorithms
```

### Frontend

```env
BACKEND_URL=http://localhost:5000
AI_SERVICE_URL=http://localhost:8000
```

For production / Vercel, set:

```env
BACKEND_URL=https://buggybot-api.onrender.com
AI_SERVICE_URL=https://buggybot-ai.onrender.com
```

## API reference

### Backend
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login
- `GET /api/auth/me` — current user
- `PATCH /api/auth/profile` — update profile
- `POST /api/chat` — create a new chat
- `POST /api/chat/:id/message` — continue a chat
- `GET /api/chat/history` — fetch chat history
- `POST /api/upload/pdf` — upload a PDF
- `GET /api/health` — backend health check

### AI service
- `POST /api/rag/chat` — stream AI chat response
- `POST /api/rag/search` — semantic search
- `GET /health` — AI service health check
- `POST /process` — PDF processing endpoint

### Frontend rewrites
- `/api/backend/*` → backend API
- `/api/ai/*` → AI service API
- `/api/ai/health` → AI service root health endpoint

## Deployment guide

### Recommended production setup
1. Create MongoDB Atlas cluster and add connection string.
2. Deploy backend and AI service on Render using `render.yaml`.
3. Set environment variables on Render:
   - Backend: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `AI_SERVICE_URL`
   - AI service: `OPENAI_API_KEY` and/or `GEMINI_API_KEY`
4. Deploy frontend on Vercel with root directory `frontend`.
5. Add production env vars:
   - `BACKEND_URL=https://buggybot-api.onrender.com`
   - `AI_SERVICE_URL=https://buggybot-ai.onrender.com`
6. Redeploy backend after updating `FRONTEND_URL`.

### CI/CD
- GitHub Actions runs lint + build checks for frontend, backend, and AI service.
- Vercel auto-deploys frontend on pushes to `main`.
- Render deploys backend and AI service from the blueprint configuration.

## Troubleshooting

### Common issues
- **404 on `/` during dev**: make sure the frontend dev server is running in `frontend/` and no stale Next.js process is occupying port 3000.
- **AI service says missing API keys**: verify `OPENAI_API_KEY` or `GEMINI_API_KEY` is set in the Render environment or local `.env`.
- **Chat fails after deploy**: verify `FRONTEND_URL` on the backend matches the exact Vercel domain and `BACKEND_URL` on the frontend points to the hosted backend.
- **Demo chat stale or not responding**: check `https://buggybot-ai.onrender.com/health` and ensure the service is awake.

### Health checks
- Backend: `https://buggybot-api.onrender.com/api/health`
- AI service: `https://buggybot-ai.onrender.com/health`

## Scripts

### Frontend
- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — lint frontend code

### Backend
- `npm run dev` — start with nodemon
- `npm run build` — compile TypeScript
- `npm run start` — run compiled server
- `npm run lint` — type-check only

### AI service
- `uvicorn main:app --reload --port 8000` — start FastAPI server
- `python -m py_compile main.py list_models.py` — verify Python syntax

## Notes

- The AI service uses **RAG** with ChromaDB and citations when the indexed collection is available.
- Uploaded PDFs are preprocessed and stored for retrieval.
- The frontend uses **proxy rewrites**, so local development can target the hosted Render services without changing the UI code.
- The project is designed to be easy to run locally and deploy to production with minimal configuration.

## Built for

- Students learning DSA and debugging
- Interview prep and code reasoning
- Teams wanting a modern AI-assisted tutoring workflow

If you want, I can also turn this README into a **shorter portfolio-style README** or a **developer-focused onboarding README** next.
