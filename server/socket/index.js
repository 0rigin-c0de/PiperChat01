import jwt from "jsonwebtoken";

const onlineUsers = new Map();

function emitPresenceSnapshot(socket) {
  socket.emit("presence_snapshot", {
    online_user_ids: Array.from(onlineUsers.keys()),
  });
}

function setUserOnline(io, userId, socketId) {
  const normalizedUserId = String(userId);
  const activeSockets = onlineUsers.get(normalizedUserId) || new Set();
  const wasOnline = activeSockets.size > 0;

  activeSockets.add(socketId);
  onlineUsers.set(normalizedUserId, activeSockets);

  if (!wasOnline) {
    io.emit("presence_updated", {
      user_id: normalizedUserId,
      online: true,
    });
  }
}

function setUserOffline(io, userId, socketId) {
  if (!userId) {
    return;
  }

  const normalizedUserId = String(userId);
  const activeSockets = onlineUsers.get(normalizedUserId);

  if (!activeSockets) {
    return;
  }

  activeSockets.delete(socketId);

  if (activeSockets.size === 0) {
    onlineUsers.delete(normalizedUserId);
    io.emit("presence_updated", {
      user_id: normalizedUserId,
      online: false,
    });
    return;
  }

  onlineUsers.set(normalizedUserId, activeSockets);
}

function attachSocketHandlers(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      socket.data.user = decoded; // { id, username, tag, profile_pic }
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  
  io.on("connection", (socket) => {
    socket.on("channelCreated", (data) => {
      io.emit("newChannel", data);
    });

    socket.on("get_userid", () => {
       
      const normalizedUserId = String(socket.data.user.id);

      if (socket.data.user_id === normalizedUserId) {
        socket.join(normalizedUserId);
        emitPresenceSnapshot(socket);
        return;
      }

      if (socket.data.user_id) {
        setUserOffline(io, socket.data.user_id, socket.id);
      }

      socket.data.user_id = normalizedUserId;
      socket.join(normalizedUserId);
      setUserOnline(io, normalizedUserId, socket.id);
      emitPresenceSnapshot(socket);
    });

    socket.on(
      "send_req",
      (receiver_id, sender_id, sender_profile_pic, sender_name) => {
        socket.to(receiver_id).emit("recieve_req", {
          sender_name: sender_name,
          sender_profile_pic: sender_profile_pic,
          sender_id,
        });
      }
    );

    socket.on(
      "req_accepted",
      (sender_id, friend_id, friend_name, friend_profile_pic) => {
        socket.to(friend_id).emit("req_accepted_notif", {
          sender_id,
          friend_name: friend_name,
          friend_profile_pic: friend_profile_pic,
        });
      }
    );

    socket.on("req_removed", (receiver_id) => {
      socket.to(receiver_id).emit("request_updated");
    });

    socket.on("join_chat", (channel_id) => {
      socket.join(channel_id);
    });

    socket.on("join_server", (server_id) => {
      const normalizedServerId = String(server_id || "");
      if (!normalizedServerId || normalizedServerId === "@me") {
        return;
      }

      if (
        socket.data.server_id &&
        socket.data.server_id !== normalizedServerId
      ) {
        socket.leave(`server:${socket.data.server_id}`);
      }

      socket.data.server_id = normalizedServerId;
      socket.join(`server:${normalizedServerId}`);
    });
 
    socket.on("send_message", (channel_id, message, timestamp) => {
      const { username, tag, profile_pic } = socket.data.user;
      socket.to(channel_id).emit("recieve_message", {
        message_data: {
          message,
          timestamp,
          sender_name: username,
          sender_tag: tag,
          sender_pic: profile_pic,
        },
      });
    });

    socket.on("disconnect", () => {
      setUserOffline(io, socket.data.user_id, socket.id);
    });
  });
}

export { attachSocketHandlers };