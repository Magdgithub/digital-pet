# Digital Pet

A cozy little digital pet starter project with a C# / ASP.NET Core REST API and a vanilla JavaScript / Vite frontend.

## Features

- Adopt and name a cat, dog, bunny, bear, fox, penguin, frog, panda, turtle, or unicorn
- Feed your pet an apple with a munching animation, play with a toy while it runs around, or let it nap for five seconds
- Dress up pets with a tiara, bow, or scarf
- Switch between pets, track their needs, and use or buy supplies
- Responsive, playful interface
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
