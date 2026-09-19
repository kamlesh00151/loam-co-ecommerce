# Loam & Co. — Houseplant E-commerce App

A small full-stack e-commerce app: a landing page, a product catalog, and an
admin dashboard with live analytics charts, backed by a Node.js/Express API
and SQLite.

## Stack

- **Frontend:** React 18 + Vite, React Router, Recharts
- **Backend:** Node.js, Express, better-sqlite3 (file-based SQL database, zero setup)
- **No external services required** — runs entirely on your machine with `npm install`

## Project structure

```
loam-co/
  backend/     Express API + SQLite database
  frontend/    React app (landing, shop, admin)
```

## Running locally

**1. Backend**
```bash
cd backend
npm install
npm run seed     # creates loam.db and fills it with sample products + 90 days of orders
npm start         # starts the API on http://localhost:4000
```

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm run dev             # starts the app on http://localhost:5173
```

Open http://localhost:5173. The admin dashboard is at `/admin`.

## API reference

Base URL: `http://localhost:4000/api`

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| GET    | `/health`                          | Health check                          |
| GET    | `/products?category=&search=`      | List products, optional filters       |
| GET    | `/products/:id`                    | Get one product                       |
| POST   | `/products`                        | Create a product                      |
| PUT    | `/products/:id`                    | Update a product                      |
| DELETE | `/products/:id`                    | Delete a product                      |
| GET    | `/categories`                      | Distinct product categories           |
| GET    | `/analytics/summary`               | Totals for dashboard cards            |
| GET    | `/analytics/revenue-timeline`      | Daily revenue, last 30 days           |
| GET    | `/analytics/revenue-by-category`   | Revenue grouped by category           |
| GET    | `/analytics/top-products`          | Top 5 products by units sold          |
| GET    | `/analytics/stock-levels`          | Stock per product                     |

Example:
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Peace Lily","category":"Low Maintenance","price":799,"stock":20}'
```

## Deploying it for real

### Option A (recommended): one service, one URL — Render

The backend can serve the built React app itself, so the whole app deploys
as a single Render Web Service with a single public URL — simplest for a
submission link.

1. Push this repo to GitHub (see below if you haven't).
2. On [render.com](https://render.com), New → Web Service → connect your repo.
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
     (this also installs and builds `frontend/`, then copies `frontend/dist`
     into `backend/public`)
   - **Start Command:** `npm start`
4. After the first deploy succeeds, open the Shell tab for the service and
   run `npm run seed` once to populate the database.
5. Your live URL (e.g. `https://loam-co.onrender.com`) now serves the
   landing page, shop, admin dashboard, and the `/api/*` routes all together.

Free-tier Render services spin down after inactivity and take ~30–50s to
wake on the next request — normal for a free plan, not a bug.

### Option B: two services — Render (API) + Vercel (frontend)

If you'd rather keep them separate (e.g. to put the frontend on a custom
domain independently):

**Backend → Render / Railway / Fly.io**
1. New Web Service, root directory `backend`, build command `npm install`,
   start command `npm start`. Run `npm run seed` once via the shell.
2. Note the URL, e.g. `https://loam-co-api.onrender.com`.

**Frontend → Vercel / Netlify**
1. Import the repo, root directory `frontend`, build command `npm run build`,
   output directory `dist`.
2. Set env var `VITE_API_URL` to `https://loam-co-api.onrender.com/api`.
3. Deploy — you get a URL like `https://loam-co.vercel.app`.

Both options auto-redeploy on every push to `main` once connected.
