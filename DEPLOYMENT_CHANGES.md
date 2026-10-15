# CivicFix Triage — Deployment Changes & Handover Guide

This document explains what changed from the original code to make the app
deployable online, and gives step-by-step instructions to merge and deploy the
newer version.

The working code lives on branch **`Supriniiii-patch-1`**.

- **Live backend (Render):** https://triage-civic-application.onrender.com
- **Live frontend (test deployment on a fork):** https://civic-triage-two.vercel.app
- **Database:** Google Cloud Firestore (collection: `complaints`, region: Johannesburg)

---

## 1. Why changes were needed

The original code only worked on a single machine (`localhost`). To host it
online so lecturers and group members can access it, four problems had to be fixed:

1. The frontend called `http://localhost:8000` directly (hardcoded).
2. The backend only allowed `localhost` through CORS.
3. Complaints were stored in an in-memory Python list, so **all data was lost**
   every time the server restarted.
4. There was no Python dependency file or Python version pin for the host.

---

## 2. What changed (file by file)

A total of **7 files** changed. Summary:

| File | What changed |
|------|--------------|
| `main.py` | CORS from env var, health check, Firestore storage |
| `requirements.txt` | New — pinned Python dependencies |
| `runtime.txt` | New — pins Python version for Render |
| `.gitignore` | Ignore Python cache + virtual envs |
| `civic-triage/app/page.tsx` | Use `NEXT_PUBLIC_API_URL` instead of localhost |
| `civic-triage/app/queue/page.tsx` | Use `NEXT_PUBLIC_API_URL` instead of localhost |
| `civic-triage/app/log-complaint/page.tsx` | Use `NEXT_PUBLIC_API_URL`, 60s timeout |

### Backend — `main.py`
- **CORS is now configurable** via an `ALLOWED_ORIGINS` environment variable
  (comma-separated list of allowed origins). Falls back to localhost locally.
- **Added a health-check route** at `GET /` so the host can confirm the service
  is alive. It also reports the current storage mode.
- **Storage moved from an in-memory list to Google Firestore** so complaints
  persist across server restarts. Credentials are read from a
  `FIREBASE_CREDENTIALS` environment variable (never committed to the repo).
  If Firestore is not configured, it safely falls back to in-memory for local dev.
- The old in-memory code is kept as `# OLD:` comments next to the new code.

### `requirements.txt` (new file)
Pins the exact Python packages the backend needs (FastAPI, uvicorn, pandas,
scikit-learn, joblib, firebase-admin, etc.) at versions verified to load the
trained model `civicfix_model.joblib` correctly.

### `runtime.txt` (new file)
Contains `python-3.13.6` so the host builds with the same Python version the
model was tested on.

### `.gitignore`
Added entries to ignore `__pycache__/`, `*.pyc`, and virtual environment folders.

### Frontend — the 3 page files
- All backend calls now use `const API_URL = process.env.NEXT_PUBLIC_API_URL`
  instead of the hardcoded `http://localhost:8000`. Old lines kept as `// OLD:`
  comments.
- In `log-complaint/page.tsx`, the triage request timeout was raised from
  **5 seconds to 60 seconds** so it tolerates the free-tier backend "cold start"
  (the server sleeps after ~15 min idle and takes 30–60s to wake).

---

## 3. Environment variables (IMPORTANT — these are not in the code)

Secrets and environment-specific values are **set in the hosting dashboards**,
never committed to the repo.

### On Render (backend)
| Key | Value |
|-----|-------|
| `FIREBASE_CREDENTIALS` | The full contents of the Firebase service-account JSON key |
| `ALLOWED_ORIGINS` | `https://<your-vercel-domain>,http://localhost:3000,http://127.0.0.1:3000` |

### On Vercel (frontend)
| Key | Value | Type |
|-----|-------|------|
| `NEXT_PUBLIC_API_URL` | `https://triage-civic-application.onrender.com` | Config (NOT Secret) |

> Note: `NEXT_PUBLIC_` variables are baked in at **build time**. If you change
> this value, you must redeploy the frontend for it to take effect.
> On Vercel it must be type **Config**, not Secret (a public URL is safe to expose).

---

## 4. How to merge the newer version

1. On GitHub, open a Pull Request:
   - **base:** `main`
   - **compare:** `Supriniiii-patch-1`
2. Review the 7 changed files listed above.
3. Merge the PR into `main`.

---

## 5. How to deploy after merging

### Backend (Render) — already live
The backend is already hosted and running from branch `Supriniiii-patch-1`.
After merging to `main`, either point the Render service at `main` or leave it on
the working branch. If creating a fresh service, use these settings:

- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** (leave blank — `main.py` is at the repo root)
- Add the `FIREBASE_CREDENTIALS` and `ALLOWED_ORIGINS` env vars (see section 3).

### Frontend (Vercel)
1. Import the repo into Vercel.
2. **Root Directory: `civic-triage`** (the inner dashboard folder — not the repo
   root, which contains a leftover starter app).
3. Add env var `NEXT_PUBLIC_API_URL` = `https://triage-civic-application.onrender.com`
   as type **Config**.
4. Deploy.
5. Copy the resulting Vercel domain and **add it to `ALLOWED_ORIGINS` on Render**,
   then redeploy the backend so CORS allows the new frontend.

---

## 6. Handling the Render cold-start delay (IMPORTANT for the live demo)

### Why it happens
The Render **free tier spins the backend down after ~15 minutes of no traffic**.
The next request has to boot the server and load the 69 MB ML model into memory,
which takes about **30–60 seconds**. During that window the app feels "stuck" or
may show the "backend offline" demo fallback.

This is normal free-tier behaviour, **not a bug**. Data in Firestore is never
lost during this — only the first request is slow.

### How to PREVENT it during the live demo (do this every time)

**Option A — Warm it up right before presenting (simplest, free, recommended)**
1. A few minutes before the demo, open this URL in a browser tab:
   https://triage-civic-application.onrender.com
2. Wait until it shows `{"status":"ok","service":"CivicTriage API","storage":"firestore"}`.
3. Then open the dashboard (https://civic-triage-two.vercel.app) and click around
   once (load the queue, log a test complaint).
4. The backend now stays awake for ~15 minutes, so everything responds instantly
   during the demo. If your slot is long, repeat the warm-up during any break.

**Option B — Keep it awake with an uptime pinger (free, hands-off)**
Use a free uptime monitor (e.g. UptimeRobot, cron-job.org) to send a request to
the health URL every ~10 minutes:
- URL to ping: `https://triage-civic-application.onrender.com/`
- Interval: every 10 minutes
This keeps the server from ever sleeping. Note: it uses up free-tier monthly
hours faster, but is fine around demo time. Turn it off afterwards if you want to
conserve hours.

**Option C — Upgrade the Render instance (paid, permanent fix)**
Render's paid tiers do not sleep. If this becomes a graded/production app, a paid
instance removes cold starts entirely. Not needed for a one-off demo.

### What already helps in the code
The frontend triage request timeout was raised to **60 seconds**, so even on a
cold start the request waits for the backend to wake instead of immediately
showing the "offline" fallback. The user just sees a loading state for up to a
minute. Warming up beforehand (Option A) avoids even that wait.

### Quick demo checklist
- [ ] 5 minutes before: open the backend health URL, wait for `{"status":"ok"...}`
- [ ] Open the dashboard and load the queue once
- [ ] Confirm a test complaint logs and shows a real prediction (no warning banner)
- [ ] Keep a tab on the backend URL and refresh it during long gaps

### Data persistence
- Complaints are stored in Firestore and **persist** across restarts, sleeps, and
  redeploys. Waking the server does not clear any data.

---

## 7. Duplicate folder note

The repo contains two Next.js apps:
- `/app` (repo root) — a leftover Create-Next-App starter. **Not the real app.**
- `/civic-triage` — the real dashboard. **This is the folder to deploy.**

Always deploy with Root Directory set to `civic-triage`.
