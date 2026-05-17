import http from "http";
import "./config/env.js";
import cors from "cors";
import express from "express";
import { Server as SocketIOServer } from "socket.io";

import { connect } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import directMessageRoutes from "./routes/directMessages.js";
import friendsRoutes from "./routes/friends.js";
import invitesRoutes from "./routes/invites.js";
import notificationRoutes from "./routes/notifications.js";
import profileRoutes from "./routes/profile.js";
import serversRoutes from "./routes/servers.js";
import { attachSocketHandlers } from "./socket/index.js";
import { setIO } from "./socket/runtime.js";

const port = process.env.PORT || 2000;
const app = express();

const allowedOrigins = (
  process.env.FRONTEND_ORIGINS ||
  "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Server is up and running!", status: "ok" });
});

app.use("/", authRoutes);
app.use("/", friendsRoutes);
app.use("/", serversRoutes);
app.use("/", invitesRoutes);
app.use("/", chatRoutes);
app.use("/", directMessageRoutes);
app.use("/", notificationRoutes);
app.use("/", profileRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      ok: false,
      message: "Invalid JSON body",
      status: 400,
    });
  }

  if (err?.message?.startsWith("CORS blocked origin")) {
    return res.status(403).json({
      ok: false,
      message: err.message,
      status: 403,
    });
  }

  console.error("[server] Unhandled error:", err?.message || err);
  return res.status(500).json({
    ok: false,
    message: "Server error",
    status: 500,
  });
});

async function start() {
  await connect();

  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    pingTimeout: 20000,
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setIO(io);
  attachSocketHandlers(io);

  server.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log("Connected to DB");
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
