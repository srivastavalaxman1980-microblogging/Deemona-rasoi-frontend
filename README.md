# Deemona Rasoi -- Frontend

Vite + React 18 app for the Deemona Rasoi meal planner. Talks to the
`deemona-rasoi-backend` API: create a household, generate an AI meal plan,
swap dishes, and build a costed grocery list. Design ships as a portable CSS
system (no Tailwind dependency) so it renders anywhere.

## Prerequisites

The backend must be running first (default `http://localhost:4000`). Start it
in the API project with `npm run dev`, confirm `GET /health` returns
`status: ok`.

## Setup (PowerShell)

```powershell
cd deemona-rasoi-frontend
npm install
Copy-Item .env.example .env    # defaults point at http://localhost:4000
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Configuration (.env)

| Var                 | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| `VITE_API_URL`      | Backend base URL. Default `http://localhost:4000`.             |
| `VITE_DEV_USER_ID`  | UUID sent as `x-user-id` (matches the backend auth seam).      |

`VITE_DEV_USER_ID` must be a UUID because `households.user_id` is a UUID
column. When you wire real auth, drop this and send your JWT instead (edit
`src/api/client.js`).

## How it maps to the API

| UI action                       | Endpoint                                      |
|---------------------------------|-----------------------------------------------|
| Generate plan (Setup form)      | `POST /api/households` + `POST .../meal-plans` |
| Edit household then regenerate   | `PATCH /api/households/:id` + generate         |
| Regenerate button               | `POST /api/households/:id/meal-plans`          |
| Swap a dish (hover a meal)       | `POST /api/meals/:mealId/swap`                 |
| Build grocery list              | `POST /api/meal-plans/:id/grocery`             |
| Reload page (restores state)    | `GET /api/households/:id`, `GET /api/meal-plans/:id` |

The household id and latest plan id are cached in `localStorage`, so a refresh
restores the current plan and grocery list.

## Structure

```
src/
  api/client.js         fetch wrapper + endpoint functions
  lib/constants.js      form options, category order
  lib/nutrition.js      client-side stats (protein/day, veg %, etc.)
  components/
    Header, SetupForm, SummaryBar, StatsRow, WeekGrid, GroceryList
  App.jsx               state + orchestration
  index.css             design system
```

## CORS note

The backend already sends `CORS_ORIGIN=*` in dev, so the Vite dev server can
call it directly. For production, set the backend `CORS_ORIGIN` to your
frontend origin.
