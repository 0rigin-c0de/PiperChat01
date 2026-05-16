<p align="center">
  <img alt="Piper" src="https://img.shields.io/badge/Piper-7C5CFC?style=for-the-badge">
  <img alt="Chat" src="https://img.shields.io/badge/Chat-22D3EE?style=for-the-badge">
</p>

<p align="center">
  Discord-style chat app • Vite + Tailwind • Express + MongoDB • Socket.IO
</p>

<p align="center">
  <a href="https://youtu.be/jZi9OCY6gsk">Watch the demo video</a>
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
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL`                           |       ❌ | **Recommended** transactional email (Resend); use `onboarding@resend.dev` locally |
| `MAIL_TRANSPORT`                                                   |       ❌ | Set to `console` to log OTPs without sending (local/tests) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`          |       ❌ | Generic SMTP fallback                  |
| `MAIL_USER` / `MAIL_PASS`                                        |       ❌ | Gmail App Password fallback            |
| `OAUTH_CLIENTID` / `OAUTH_CLIENT_SECRET` / `OAUTH_REFRESH_TOKEN` |       ❌ | Gmail OAuth2 fallback                  |
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

## CI checks

This repository uses GitHub Actions to run automated checks on every pull
request and every push to `main`.

The workflow lives at `.github/workflows/ci.yml` and currently runs:

- Frontend dependency install with `npm ci`
- Frontend linting with `npm run lint`
- Frontend production build with `npm run build`
- Backend dependency install with `npm ci`

These checks help contributors catch broken builds, lint errors, and dependency
issues before maintainers review the pull request.

To run the same checks locally:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

```bash
cd server
npm ci
```

Backend auth checks (including signup/verify with console mail transport):

```bash
cd server
npm run test:auth
```

### Email / OTP configuration

OTP emails are sent through `server/services/email.js`. Configure **one** provider; the server picks the first match in this order:

1. `MAIL_TRANSPORT=console` — logs the OTP to the server console (no delivery). Used by `npm run test:auth`.
2. `RESEND_API_KEY` — [Resend](https://resend.com) (preferred for production). Set `RESEND_FROM_EMAIL` to a verified sender (e.g. `PiperChat <onboarding@resend.dev>` for sandbox). Until you verify a domain, Resend only delivers to the email address on your Resend account.
3. `SMTP_HOST` + credentials — any SMTP relay.
4. `MAIL_USER` + `MAIL_PASS` — Gmail app password.
5. `OAUTH_*` — Gmail OAuth2.

If nothing is configured, signup and resend still work but responses include `email_sent: false`.

Backend tests are not included in CI yet beyond dependency install. Run `npm run test:auth` locally before changing auth or email behavior.
