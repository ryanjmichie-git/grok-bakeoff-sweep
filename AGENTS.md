# AGENTS.md: Factory Inventory app

A Vue 3 client over a FastAPI server with sample data. The task is in `ISSUES.md`.

## Stack and layout

- Client (`client/`): Vue 3, Vite, vue-router. One file per screen in `client/src/views/`; shared
  parts in `client/src/components/` and `client/src/composables/`; screen text in `client/src/locales/`.
- Server (`server/`): FastAPI on port 8001 (`server/main.py`), sample data in `server/data/`.
- Backend tests: `tests/backend/`.

## Commands

```bash
npm --prefix client ci      # install the client
uv sync --project server    # install the server
npm run typecheck           # compile every .vue and .js file in client/src
npm run lint                # scope check: only client/src may change
npm run build               # vite build of the client
npm run test:backend        # backend tests
npm run verify              # all of the above plus test:hook (the gate)
```

Run the app: `uv run --project server python server/main.py` (API on port 8001), then
`npm --prefix client run dev` (http://localhost:3000).

## The gate

A Stop hook (`.grok/hooks/stop-verify.json`, running `node bin/stop-verify.mjs`) runs
`npm run verify` when the main agent ends a turn. If it fails, the error comes back and the
agent keeps working. Each run adds a line to `.grok/logs/stop-verify.log`.
