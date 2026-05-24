# BuggyBot — Production deployment (Vercel + CI/CD)

| Component | Platform | URL example |
|-----------|----------|-------------|
| **Frontend** | [Vercel](https://vercel.com) | `https://buggybot.vercel.app` |
| **Backend API** | [Render](https://render.com) | `https://buggybot-api.onrender.com` |
| **AI service** | [Render](https://render.com) | `https://buggybot-ai.onrender.com` |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | connection string |

---

## Part 1 — GitHub (CI on every push)

Code is already wired for CI in `.github/workflows/ci.yml`:

- Frontend: lint + build  
- Backend: lint + build  
- AI service: dependency + import check  

Push to `main` on https://github.com/Suhail7985/BuggyBot — Actions run automatically.

---

## Part 2 — MongoDB Atlas (5 min)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. **Database Access** → add user + password.
3. **Network Access** → allow `0.0.0.0/0` (or Render IPs).
4. **Connect** → copy connection string, e.g.  
   `mongodb+srv://user:pass@cluster.mongodb.net/buggybot`

---

## Part 3 — Deploy backend + AI on Render (15 min)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect GitHub repo **Suhail7985/BuggyBot**.
3. Render reads `render.yaml` and creates **buggybot-api** + **buggybot-ai**.
4. Set secrets when prompted:
   - **buggybot-api**: `MONGODB_URI`, `FRONTEND_URL` (set after Vercel — use `https://your-app.vercel.app`)
   - **buggybot-ai**: `GEMINI_API_KEY` and/or `OPENAI_API_KEY`
5. Wait for both services to be **Live**. Copy URLs:
   - API: `https://buggybot-api.onrender.com`
   - AI: `https://buggybot-ai.onrender.com`

**Note:** Free Render services sleep after inactivity; first request may take ~30s.

**Chroma / PDF:** For full RAG on Render, attach a persistent disk or re-upload PDF via the app after deploy. Local `chroma_db` is not in git.

---

## Part 4 — Deploy frontend on Vercel (10 min)

### Option A — Vercel + GitHub (recommended, easiest)

1. [vercel.com/new](https://vercel.com/new) → Import **Suhail7985/BuggyBot**.
2. **Root Directory** → `frontend` (important).
3. **Environment Variables** (Production):

| Name | Value |
|------|--------|
| `BACKEND_URL` | `https://buggybot-api.onrender.com` |
| `AI_SERVICE_URL` | `https://buggybot-ai.onrender.com` |

4. Deploy. Copy your URL, e.g. `https://buggybot-xxx.vercel.app`.
5. Update Render **buggybot-api** env `FRONTEND_URL` to that Vercel URL and redeploy API.

Vercel auto-deploys on every push to `main`.

### Option B — GitHub Actions deploy to Vercel

Use this if you want deploy controlled by Actions instead of Vercel Git hooks.

1. Install Vercel CLI locally: `npm i -g vercel`
2. In `frontend` folder: `vercel link` (creates `.vercel/project.json` — **do not commit**).
3. Get IDs:
   - `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` from `.vercel/project.json` or Vercel → Project → Settings.
   - `VERCEL_TOKEN` from [vercel.com/account/tokens](https://vercel.com/account/tokens).
4. GitHub repo → **Settings** → **Secrets and variables** → **Actions** → add:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Team/user id |
| `VERCEL_PROJECT_ID` | Project id |

5. Push to `main` → workflow **Deploy to Vercel** runs (`.github/workflows/deploy-vercel.yml`).

---

## Part 5 — Verify production

1. Open Vercel URL → landing **demo chat** should answer (AI service up).
2. **Register** → login → **New chat** (needs API + MongoDB).
3. Check health:
   - `https://buggybot-api.onrender.com/api/health`
   - `https://buggybot-ai.onrender.com/health`

---

## Environment checklist

### Vercel (`frontend`)

```
BACKEND_URL=https://buggybot-api.onrender.com
AI_SERVICE_URL=https://buggybot-ai.onrender.com
```

### Render `buggybot-api`

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<random 32+ chars>
JWT_REFRESH_SECRET=<random 32+ chars>
FRONTEND_URL=https://your-app.vercel.app
AI_SERVICE_URL=https://buggybot-ai.onrender.com
```

### Render `buggybot-ai`

```
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
CHROMA_DB_PATH=/app/chroma_db
PRELOAD_COLLECTION_NAME=grokking_algorithms
```

---

## CI/CD summary

```mermaid
flowchart LR
  push[Push to main] --> ci[GitHub Actions CI]
  push --> vercel[Vercel auto deploy]
  push --> gha[Vercel GHA deploy optional]
  ci --> lint[Lint and build all apps]
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Chat auth fails on Vercel | Set `FRONTEND_URL` on API to exact Vercel URL; cookies use `SameSite=None` in production. |
| Demo works, logged-in chat fails | Check `BACKEND_URL` on Vercel and MongoDB `MONGODB_URI` on Render. |
| AI error / timeout | Wake Render AI service; check `GEMINI_API_KEY` / quota. |
| Build fails on Vercel | Root directory must be `frontend`; set `BACKEND_URL` before build. |

---

## Local development

```bash
cd backend && cp .env.example .env && npm run dev
cd ai-service && cp .env.example .env && uvicorn main:app --reload --port 8000
cd frontend && npm run dev
```
