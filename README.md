# Digital Pet

A small full-stack digital pet starter project with a C# / ASP.NET Core REST API and a vanilla JavaScript / Vite frontend.

## Features

- Create a named pet
- View hunger, happiness, energy, and coins
- Feed, play with, and put your pet to sleep
- Manage pet inventory and use food, treats, and toys
- Buy items from a small shop with coins
- In-memory storage for local development (data resets when the backend restarts)

## Requirements

- .NET 8 SDK
- Node.js 18+

## Run locally

Start the C# backend in one terminal:

```bash
dotnet run --project backend-csharp
```

Start the JavaScript frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually http://localhost:5173). Vite proxies `/api` requests to the ASP.NET Core API at http://localhost:8080.

## API overview

- `GET /api/pets` — list pets
- `POST /api/pets` — create a pet with `{ "name": "Mochi" }`
- `GET /api/pets/{id}` — get a pet
- `POST /api/pets/{id}/actions/feed` — feed the pet
- `POST /api/pets/{id}/actions/play` — play with the pet
- `POST /api/pets/{id}/actions/sleep` — let the pet sleep
- `GET /api/items` — list shop items
- `POST /api/pets/{id}/inventory/{itemId}/use` — use an inventory item
- `POST /api/pets/{id}/inventory/{itemId}/purchase` — buy an item

Pet stats range from 0 to 100. Hunger increases when a pet sleeps; lower hunger is better. Inventory and pets are currently kept in memory, so a database can be added later.
