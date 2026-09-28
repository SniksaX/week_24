# auth

This project uses [Bun](https://bun.sh). The API and the React app are one package.

```bash
bun install
cp .env.example .env
bun run dev
```

`bun run dev` starts the API on http://localhost:3000 and Vite on http://localhost:5173. The Vite app proxies `/api` to the API.

```bash
bun run dev:api
```

Build and serve the API and the UI from one process on port 3000:

```bash
bun run build
bun start
```

Or with Docker:

```bash
docker-compose up --build
```
