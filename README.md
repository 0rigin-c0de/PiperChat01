<p align="center">
  <img alt="Piper" src="https://img.shields.io/badge/Piper-7C5CFC?style=for-the-badge">
  <img alt="Chat" src="https://img.shields.io/badge/Chat-22D3EE?style=for-the-badge">
</p>

<p align="center">
  Discord-style chat app • Vite + Tailwind • Express + MongoDB • Socket.IO
</p>

<p align="center">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-React-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind" src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Node" src="https://img.shields.io/badge/Node.js-ESM-339933?logo=node.js&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white">
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO--010101?logo=socket.io&logoColor=white">
</p>

## What is this?

PiperChat is a Discord-style chat app with:

- Direct Messages + Servers/Channels
- Realtime updates via Socket.IO
- Presence + unread counts
- Email OTP verification 
- Profile updates (display name + avatar) with Supabase storage
- Optional Redis caching (Upstash supported)

## Project structure

- `server/` → Express + MongoDB + Socket.IO API (ESM)
- `frontend/` → Vite + Tailwind UI

## Quick start

### 1) Install dependencies

```bash
cd server && npm install
cd ../frontend && npm install
```

### 2) Environment variables

- Copy `PiperChat01/.env.example` → `/PiperChat01/.env`
- Copy `PiperChat01/frontend/.env.example` → `PiperChat01/frontend/.env`

### 3) Run the apps

```bash
cd server && npm start
```

```bash
cd frontend && npm run dev
```

Frontend runs on `http://localhost:5173`  
Server runs on `http://localhost:2000`

## Environment variables

### Server (`PiperChat01/.env`)

| Key                                                              | Required | Notes                                  |
| ---------------------------------------------------------------- | -------: | -------------------------------------- |
| `MONGO_URI`                                                      |       ✅ | MongoDB connection string              |
| `ACCESS_TOKEN`                                                   |       ✅ | JWT secret                             |
| `PORT`                                                           |       ❌ | Default `2000`                         |
| `default_profile_pic`                                            |       ✅ | Used on signup                         |
| `MAIL_USER` / `MAIL_PASS`                                        |       ✅ | Gmail App Password flow                |
| `OAUTH_CLIENTID` / `OAUTH_CLIENT_SECRET` / `OAUTH_REFRESH_TOKEN` |       ❌ | Optional OAuth2 email sending          |
| `REDIS_URL`                                                      |       ❌ | Upstash URL supported (`rediss://...`) |
| `REDIS_CACHE_TTL_SECONDS`                                        |       ❌ | Default `30`                           |

### Frontend (`PiperChat01/frontend/.env`)

| Key                           | Required | Notes                                  |
| ----------------------------- | -------: | -------------------------------------- |
| `REACT_APP_URL`               |       ✅ | Backend URL (`http://localhost:2000`)  |
| `REACT_APP_front_end_url`     |       ✅ | Frontend URL (`http://localhost:5173`) |
| `REACT_APP_SUPABASE_URL`      |       ❌ | For avatar uploads                     |
| `REACT_APP_SUPABASE_ANON_KEY` |       ❌ | For avatar uploads                     |
| `REACT_APP_SUPABASE_BUCKET`   |       ❌ | For avatar uploads                     |

## Scripts

### Server

- `npm start` → runs with nodemon

### Frontend

- `npm run dev` → Vite dev server
- `npm run build` → production build
- `npm run lint` → ESLint
