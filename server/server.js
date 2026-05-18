import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import corsOptions from "./src/config/cors.js";

import authRoutes from "./src/routes/auth.js";
import chatRoutes from "./src/routes/chat.js";
import directMessageRoutes from "./src/routes/directMessages.js";
import friendsRoutes from "./src/routes/friends.js";
import invitesRoutes from "./src/routes/invites.js";
import notificationRoutes from "./src/routes/notifications.js";
import profileRoutes from "./src/routes/profile.js";
import serversRoutes from "./src/routes/servers.js";

const app = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running!",
    status: "ok",
  });
});

app.use("/", authRoutes);
app.use("/", friendsRoutes);
app.use("/", serversRoutes);
app.use("/", invitesRoutes);
app.use("/", chatRoutes);
app.use("/", directMessageRoutes);
app.use("/", notificationRoutes);
app.use("/", profileRoutes);

export default app;
