# Digital Pet

A cozy little digital pet starter project with a C# / ASP.NET Core REST API and a vanilla JavaScript / Vite frontend.

## Features

- Adopt and name a cat, dog, bunny, bear, fox, penguin, frog, panda, turtle, or unicorn
- Feed your pet an animated apple, play as it runs after a yarn ball, or let it sleep for five seconds
- Dress pets with vector-drawn tiaras, bows, and scarves
- Switch between pets, track their needs, and use or buy supplies
- Animated vector artwork and a responsive, playful interface (no emoji animal art)
- In-memory backend storage for local development (data resets when the backend restarts)

## Requirements

- .NET 8 SDK
- Node.js 16 or newer (Vite 4 is used for compatibility)

## Run locally

Start the backend in one terminal:

```bash
dotnet run --project backend-csharp -- --urls http://localhost:8080
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually http://localhost:5173. Vite proxies `/api` requests to the ASP.NET Core API at http://localhost:8080.
