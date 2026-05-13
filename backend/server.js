require("dotenv").config();

const app = require("./src/app");

const ConDB = require("./src/db/db");

const cors = require("cors");

const dns = require("dns");

const http = require("http");

const { Server } = require("socket.io");

const {
  initSocket,
} = require("./src/socket");

// ======================================
// DNS
// ======================================
dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

// ======================================
// CORS
// ======================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ======================================
// CREATE HTTP SERVER
// ======================================
const server =
  http.createServer(app);

// ======================================
// SOCKET IO
// ======================================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// INIT SOCKET
initSocket(io);

// ======================================
// ONLINE USERS
// ======================================
global.onlineUsers =
  new Map();

// ======================================
// SOCKET CONNECTION
// ======================================
io.on(
  "connection",
  (socket) => {

    console.log(
      "User Connected:",
      socket.id
    );

    // =========================
    // USER JOIN
    // =========================
    socket.on(
      "join",
      (userId) => {

        onlineUsers.set(
          userId,
          socket.id
        );

        console.log(
          "ONLINE USERS:",
          Array.from(
            onlineUsers.keys()
          )
        );

        // SEND ONLINE USERS
        io.emit(
          "online_users",
          Array.from(
            onlineUsers.keys()
          )
        );
      }
    );

    // =========================
    // SEND MESSAGE
    // =========================
    socket.on(
      "send_message",
      (data) => {

        const receiverSocket =
          onlineUsers.get(
            data.receiver
          );

        if (receiverSocket) {

          io.to(
            receiverSocket
          ).emit(
            "receive_message",
            data
          );
        }
      }
    );

    // =========================
    // DISCONNECT
    // =========================
    socket.on(
      "disconnect",
      () => {

        for (const [
          userId,
          socketId,
        ] of onlineUsers.entries()) {

          if (
            socketId ===
            socket.id
          ) {

            onlineUsers.delete(
              userId
            );

            break;
          }
        }

        console.log(
          "ONLINE USERS:",
          Array.from(
            onlineUsers.keys()
          )
        );

        // UPDATE ONLINE USERS
        io.emit(
          "online_users",
          Array.from(
            onlineUsers.keys()
          )
        );

        console.log(
          "Disconnected:",
          socket.id
        );
      }
    );
  }
);

// ======================================
// PORT
// ======================================
const port =
  process.env.PORT || 3000;

// ======================================
// START SERVER
// ======================================
const startServer =
  async () => {

    try {

      await ConDB();

      server.listen(
        port,
        () => {

          console.log(
            `Server running on port ${port}`
          );
        }
      );

    } catch (error) {

      console.log(
        "Database connection failed:",
        error
      );
    }
  };

startServer();