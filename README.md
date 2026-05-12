<p align="center">
  <img width="2172" height="724" alt="ChatGPT Image May 12, 2026, 07_15_49 PM" src="https://github.com/user-attachments/assets/93d60fbb-a14a-408d-bbb7-96ff031e0a1e" />
</p>

<h1 align="center"> PiperChat</h1>

<p align="center">
  <strong>A Discord-style real-time chat app</strong>
  <br>
  with DMs, servers/channels, presence, and email OTP auth built with Vite + Tailwind and an Express + MongoDB + Socket.IO backend.
</p>
<p align="center">
  <a href="https://youtu.be/jZi9OCY6gsk">Watch the demo video</a>
</p>

<a name="readme-top"></a>

<img src="https://github.com/AnderMendoza/AnderMendoza/raw/main/assets/line-neon.gif" width="100%">

## 📖 Table of Contents
* [About the Project](#about)
* [Key Features](#features)
* [Visual Showcase](#visual-showcase)
* [Tech Stack](#tech-stack)
* [Documentation](#documentation)
* [Contact](#contacts)
---

<a name="about"></a>
## ✨ About PiperChat

PiperChat is more than just a chat app; it's a full-scale demonstration of modern web capabilities. Designed to mimic the seamless experience of Discord, it bridges the gap between complex backend architecture and a "pixel-perfect" frontend. 

Whether you're managing a community through **Servers and Channels** or having a private conversation via **Direct Messages**, PiperChat ensures sub-millisecond delivery using Socket.IO and optimized MongoDB indexing.

---

<a name="features"></a>
## 🚀 Key Features

### 💬 Real-Time Messaging
- **Instant Delivery:** Powered by Socket.IO for a lag-free experience.
- **Presence Tracking:** See who's online, idle, or offline in real-time.
- **Unread Indicators:** Never miss a message with smart notification counts.

### 🏠 Architecture & Organization
- **Servers & Channels:** Structured communication for different topics.
- **Direct Messaging:** Secure one-on-one private conversations.

### 🔒 Security & User Management
- **Email OTP Verification:** Robust signup flow ensuring authentic users.
- **Profile Customization:** Update display names and avatars seamlessly.
- **Cloud Storage:** High-speed image hosting via Supabase storage buckets.

### ⚡ Performance Optimization
- **Redis Caching:** Optional Upstash integration for ultra-fast data retrieval.
- **Tailwind v4:** Utilizing the latest CSS engine for high-performance, small-bundle styling.

<a name="visual-showcase"></a>
## 📸 Visual Showcase

### 🔐 Secure Authentication
> *A smooth login experience featuring secure Email OTP verification.*
> <img width="894" height="540" alt="image" src="https://github.com/user-attachments/assets/5d498a0e-602c-4cf0-a73e-7f181488209a" />
> <img width="606" height="485" alt="image" src="https://github.com/user-attachments/assets/0e090aca-3aa5-4cfd-a378-a982e6a7d27e" />


### 📝 Seamless Account Creation
> *The onboarding flow featuring user registration and the Email OTP verification system to ensure secure access.*

<!-- ADD YOUR SIGNUP/ACCOUNT CREATION SCREENSHOT BELOW -->
> <img width="638" height="501" alt="image" src="https://github.com/user-attachments/assets/3e7d3c17-83b1-419f-985f-df3a503071a7" />

### 🖥️ Dashboard UI
> *The main interface featuring the server list, channel navigation, and the primary chat window.*

<!-- ADD YOUR DASHBOARD SCREENSHOT BELOW -->
<img width="1086" height="640" alt="image" src="https://github.com/user-attachments/assets/3401c1c9-d9cd-4edd-9ef7-1f3cf4ac1d66" />


<a name="tech-stack"></a>
## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS v4 |
| **Backend** | Node.js (ESM), Express.js |
| **Real-time** | Socket.IO |
| **Database** | MongoDB (Atlas) |
| **Storage** | Supabase |
| **Caching** | Redis (Upstash) |

---

<a name="how-to-use"></a>
## 🛠️ How to Use

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Supabase Project (for avatars)

### 2. Installation
```bash
# Clone the repository
git clone [https://github.com/YourUsername/PiperChat.git](https://github.com/YourUsername/PiperChat.git)

# Install Server dependencies
cd server && npm install

# Install Frontend dependencies
cd ../frontend && npm install

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

Backend tests are not included yet because the backend does not currently have a
test script. Once backend tests are added, the CI workflow can be extended to run
`npm test` inside `server/`.


<img src="https://github.com/AnderMendoza/AnderMendoza/raw/main/assets/line-neon.gif" width="100%">

<a name="documentation"></a>
## 📄 Documentation

For a detailed breakdown of the API endpoints and component structure, please refer to our [Wiki](https://github.com/0rigin-c0de/PiperChat01/wiki) (Coming Soon).

### 🛠️ CI/CD Workflow
We use **GitHub Actions** to maintain code quality. Every pull request is automatically checked for:
*   **Successful Builds:** Verified for both Frontend & Backend.
*   **Linting Standards:** Automated checking via ESLint.
*   **Dependency Integrity:** Ensures all packages are secure and functional.

---

<a name="contacts"></a>
## 🤝 Contacts

| Source | Link |
| :--- | :--- |
| **GitHub Profile** | [0rigin-c0de](https://github.com/0rigin-c0de) |
| **Project Repository** | [PiperChat01](https://github.com/0rigin-c0de/PiperChat01) |

---

<p align="right">
  <a href="#readme-top">⬆️ Back to Top</a>
</p>

<p align="center">
  <b>Don't forget to ⭐ star the repo if you like this project!</b>
  <br>
  Made with ❤️ for the 🌍
</p>
