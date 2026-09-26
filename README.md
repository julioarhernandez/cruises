# Cruises

A small cruise search app with an AI assistant made with React, Fastify, testing and LLM tool calling.

- `apps/server`: Fastify API serving `data/cruises.json`, plus `POST /assistant` (Claude with a `searchCruises` tool)
- `apps/client`: React + Vite UI (search, cruise details, assistant chat)
- `packages/shared`: TypeScript types used by both

## Running it

```sh
npm install
cp apps/server/.env.example apps/server/.env   # add your ANTHROPIC_API_KEY

npm run dev:server   # http://localhost:3000
npm run dev:client   # http://localhost:5173 (proxies /api to the server)
```

Everything except the assistant works without an API key.

## API

| Method | Path            | Notes                                                                                |
| ------ | --------------- | ------------------------------------------------------------------------------------ |
| GET    | `/cruises`      | Filters: `q`, `destination`, `maxPrice`, `minNights`, `maxNights`, `month` (YYYY-MM) |
| GET    | `/cruises/:id`  | 404 if not found                                                                     |
| GET    | `/destinations` | Unique destinations, sorted                                                          |
| POST   | `/assistant`    | Body: `{ messages: [{ role, content }] }` → `{ reply, cruises }`                     |

## Tests

```sh
npm test
```

The assistant tests use a fake Claude client, so they don't need an API key.
