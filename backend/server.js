require("dotenv").config();

const app = require("./src/app");
const ConDB = require("./src/db/db");
const cors = require("cors");
const dns = require("dns");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./src/socket");

// ======================================
// DNS (optional)
// ======================================
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ======================================
// CORS (FIXED)
// ======================================
app.use(
  cors({
    origin: true, // 🔥 IMPORTANT FIX (allow all origins)
    credentials: true,
  })
);

// ======================================
// HTTP SERVER
// ======================================
const server = http.createServer(app);

// ======================================
// SOCKET.IO (FIXED)
// ======================================
const io = new Server(server, {
  cors: {
    origin: true, // 🔥 FIXED
    credentials: true,
  },
});

// INIT SOCKET MODULE
initSocket(io);

// ======================================
// ONLINE USERS
// ======================================
global.onlineUsers = new Map();

// ======================================
// SOCKET CONNECTION
// ======================================
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // JOIN USER
  socket.on("join", (userId) => {
  onlineUsers.set(String(userId), socket.id);

  io.emit("online_users", Array.from(onlineUsers.keys()));
});
  // SEND MESSAGE
  socket.on("send_message", (data) => {
  const receiverId = String(data.receiverId);

  const receiverSocket = onlineUsers.get(receiverId);

  console.log("SEND MESSAGE DEBUG:", {
    receiverId,
    onlineUsers: Array.from(onlineUsers.keys()),
  });

  if (receiverSocket) {
    io.to(receiverSocket).emit("receive_message", data);
  }
});
  // DISCONNECT
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("online_users", Array.from(onlineUsers.keys()));

    console.log("Disconnected:", socket.id);
  });
});

// ======================================
// PORT
// ======================================
const port = process.env.PORT || 3000;

// ======================================
// START SERVER
// ======================================
const startServer = async () => {
  try {
    await ConDB();

    server.listen(port, "0.0.0.0", () => {
      console.log("==================================");
      console.log(`Server running on port ${port}`);
      console.log("==================================");
    });
  } catch (error) {
    console.log("Database connection failed:", error);
  }
};

startServer();