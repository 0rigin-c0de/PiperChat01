import "dotenv/config"
import config from "./src/config/index.js"

import app from "./server.js";
import { Server as SocketIOServer } from "socket.io";
import { connect } from "./src/config/db.js";
import { attachSocketHandlers } from "./src/socket/index.js";
import { setIO } from "./src/socket/runtime.js";
import { verifyMailTransport } from "./src/services/email.js";

let server;

(async function startServer() {
  try {
    await connect();
    await verifyMailTransport();

    server = app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
      console.log("Database connected successfully");
    });

    const allowedOrigins = (
      config.FRONTEND_ORIGINS ||
      "http://localhost:3000,http://localhost:5173"
    )
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const io = new SocketIOServer(server, {
      pingTimeout: 20000,
      cors: {
        origin: allowedOrigins,
      },
    });
    setIO(io);
    attachSocketHandlers(io);
  } catch (error) {
    console.error("Failed to start server", error);
    if (config.NODE_ENV === "production") process.exit(1);
  }
})();

// Handle graceful shutdown on termination signals
const serverTermination = async (signal) => {
  try {
    // Log a warning indicating the server is shutting down
    console.log(`${signal} received. Shutting down gracefully...`);

    // Close http server
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);

          console.log("HTTP server closed");
          resolve();
        });
      });
    }

    // Exit the process cleanly
    process.exit(0);
  } catch (error) {
    console.error("Error during server shutdown:", error);
    process.exit(1);
  }
};

// Listen for the termination signals and trigger graceful shutdown
process.on("SIGTERM", serverTermination);
process.on("SIGINT", serverTermination);
