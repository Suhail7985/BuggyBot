# Deploy Backend + AI Service on Render (step by step)

Repo: **https://github.com/Suhail7985/BuggyBot**

You will create **2 web services** on Render:
1. **buggybot-ai** (Python / FastAPI) — deploy first  
2. **buggybot-api** (Node / Express) — needs the AI URL  

You also need **MongoDB Atlas** (free) for the backend.

---

## Before you start

Have these ready:

| Item | Where to get it |
|------|------------------|
| GitHub repo pushed | `git push origin main` |
| MongoDB URI | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| (Optional) `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com/api-keys) |

---

## Part A — MongoDB Atlas (one time)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a **free M0 cluster** (any cloud / region).
3. **Database Access** → **Add New Database User** → username + password → save.
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → Confirm.  
   (Required so Render can connect.)
5. **Database** → **Connect** → **Drivers** → copy the connection string.  
   Example:  
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/buggybot?retryWrites=true&w=majority`  
   Replace `USER`, `PASSWORD`, and ensure database name `buggybot` is in the path.
6. Save this as **MONGODB_URI** (you will paste it into Render later).

---

## Part B — Deploy AI service first

### Option 1 — Blueprint (fastest)

1. Open [dashboard.render.com](https://dashboard.render.com) and sign in with **GitHub**.
2. Click **New +** → **Blueprint**.
3. Connect repository **Suhail7985/BuggyBot**.
4. Render reads `render.yml` (at repo root) and shows **buggybot-api** and **buggybot-ai**.
5. Click **Apply** / **Create**.
6. When asked for secrets on **buggybot-ai**, set:
   - `GEMINI_API_KEY` = your key (from local `ai-service/.env`)
   - Leave `OPENAI_API_KEY` empty if you only use Gemini
7. Wait until **buggybot-ai** status is **Live** (first Docker build can take 10–15 min on free tier).
8. Open the AI URL, e.g. `https://buggybot-ai.onrender.com/health` — you should see JSON with `"status":"ok"`.

Skip to **Part C** to configure the backend.

### Option 2 — Manual (step by step)

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect **Suhail7985/BuggyBot** repository.
3. Settings:

| Field | Value |
|-------|--------|
| **Name** | `buggybot-ai` |
| **Region** | Oregon (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | `ai-service` |
| **Runtime** | **Docker** |
| **Instance type** | Free |

4. **Advanced** → **Health Check Path**: `/health`

5. **Environment Variables** → Add:

| Key | Value |
|-----|--------|
| `GEMINI_API_KEY` | your Gemini key |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `CHROMA_DB_PATH` | `/app/chroma_db` |
| `PRELOAD_COLLECTION_NAME` | `grokking_algorithms` |

6. Click **Create Web Service** and wait until **Live**.

7. Copy the public URL (top of the page), e.g.  
   `https://buggybot-ai.onrender.com`

8. Test in browser:  
   `https://buggybot-ai.onrender.com/health`  
   `https://buggybot-ai.onrender.com/docs` (API docs)

---

## Part C — Deploy backend (API)

### If you used Blueprint

1. In Render dashboard, open **buggybot-api**.
2. **Environment** → set / confirm:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | long random string (32+ chars) — or use auto-generated |
| `JWT_REFRESH_SECRET` | another long random string |
| `FRONTEND_URL` | `http://localhost:3000` for now (change after Vercel) |
| `AI_SERVICE_URL` | `https://buggybot-ai.onrender.com` (your AI URL, **no** trailing slash) |

3. **Manual Deploy** → **Deploy latest commit** if needed.
4. Wait until **Live**.

### If you deploy backend manually

1. **New +** → **Web Service** → same GitHub repo.
2. Settings:

| Field | Value |
|-------|--------|
| **Name** | `buggybot-api` |
| **Root Directory** | `backend` |
| **Runtime** | **Node** |
| **Build Command** | `npm ci --include=dev && npm run build && npm prune --omit=dev` |
| **Start Command** | `npm start` |
| **Instance type** | Free |

3. **Health Check Path**: `/api/health`

4. **Environment Variables**:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas URI |
| `JWT_SECRET` | random 32+ char secret |
| `JWT_REFRESH_SECRET` | random 32+ char secret |
| `AI_SERVICE_URL` | `https://buggybot-ai.onrender.com` |
| `FRONTEND_URL` | `http://localhost:3000` (update later) |

5. **Create Web Service** → wait until **Live**.

6. Test:  
   `https://buggybot-api.onrender.com/api/health`  
   Should return `"success": true`.

---

## Part D — Link backend ↔ AI

1. **buggybot-api** → **Environment** → `AI_SERVICE_URL` must be exactly:  
   `https://buggybot-ai.onrender.com`  
   (HTTPS, no `/` at the end)
2. Save → Render redeploys the API automatically.
3. In **buggybot-ai** logs, after a chat request you should see activity (not connection errors).

---

## Part E — Test full stack (before Vercel)

From your PC (with frontend running locally):

**frontend/.env.local**
```env
BACKEND_URL=https://buggybot-api.onrender.com
AI_SERVICE_URL=https://buggybot-ai.onrender.com
```

```bash
cd frontend
npm run dev
```

1. Open `http://localhost:3000` → demo chat → ask a DSA question.  
2. Register → login → new chat.

> **Free tier note:** Render sleeps after ~15 min idle. First request can take **30–60 seconds** to wake services.

---

## Part F — After you deploy Vercel (frontend)

1. Deploy frontend on Vercel (root dir `frontend`).
2. Copy Vercel URL, e.g. `https://buggybot.vercel.app`.
3. Render → **buggybot-api** → set `FRONTEND_URL` to that URL → redeploy.
4. Vercel env:
   ```env
   BACKEND_URL=https://buggybot-api.onrender.com
   AI_SERVICE_URL=https://buggybot-ai.onrender.com
   ```

---

## RAG / Grokking Algorithms on Render

`chroma_db` and `data/*.pdf` are **not** in Git (too large / secrets). On a fresh Render deploy:

- Chat still works using the LLM (Gemini/OpenAI).
- **Book-grounded RAG** needs either:
  - Upload a PDF in the app (**Upload** page), or  
  - Add `grokking_algorithms.pdf` under `ai-service/data/` and redeploy (if you choose to commit it), or  
  - Use a Render **persistent disk** on a paid plan for `chroma_db`.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API build fails | Check Render logs; ensure build command includes `--include=dev`. |
| API crashes on start | Wrong `MONGODB_URI` or Atlas IP not allowed. |
| `AI service error` in chat | Wrong `AI_SERVICE_URL` on backend; AI service not Live. |
| 502 / timeout | Free instance waking up — wait and retry. |
| Gemini quota error | Use `GEMINI_MODEL=gemini-2.5-flash` or add `OPENAI_API_KEY`. |
| CORS / login fails from Vercel | Set `FRONTEND_URL` on API to exact Vercel URL. |

---

## Quick reference — your URLs

Fill in after deploy:

```
AI_SERVICE_URL=https://buggybot-ai.onrender.com
BACKEND_URL=https://buggybot-api.onrender.com
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://________.vercel.app
```
